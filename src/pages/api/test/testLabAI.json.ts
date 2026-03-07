import type { APIRoute } from "astro";
import weaviate, { type WeaviateClient } from 'weaviate-client';

//get API key and URL
const API_KEY = import.meta.env.LABAI_API_KEY;
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";

//connect to local Weaviate DB
const DBclient: WeaviateClient = await weaviate.connectToLocal();

//_____________________________________________________________________

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
        messages? : { role: string; content: string }[];
    }

    //basic check
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Body must include a non-empty 'messages' array" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    var messages = body.messages;

//_____________________________________________________________________

    try {
      //QUERY TRANSFORMATION
      //we give the last few messages to the llm and tell it to rewrite them into a proper search query for the DB
      const recentMessages = messages.slice(-6);
      //removing the first messages if they have the role assistant or system
      while (recentMessages[0].role == "assistant" || recentMessages[0].role == "system") {
        recentMessages.splice(0,1);
      }
      //creating the messages array for query transformation
      const rewriteMessages: { role: string; content: string }[] = [
        {
          role: "system",
          content: "Ton rôle est de réécrire le dernier message de l'utilisateur en une requête de recherche simple, courte et claire, pour une base de données vectorielle. La requête doit fonctionner seule et contenir les noms des personnages, lieux ou évènements concernés. Son but est de trouver les éléments les plus cohérents pour alimenter les réponses. Retourne uniquement la requête."
        },
        ...recentMessages,
      ]

      //get the response from the llm
      const rewriteRes = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        model: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
        messages : rewriteMessages,
        }),
      });

      const data = await rewriteRes.json();
      const rewrittenQuery = data.choices?.[0]?.message.content;
      console.log("successfully rewritten query : " + rewrittenQuery);
    
//_____________________________________________________________________

      //RAG
      //we search for relevant elements in the database and add them to the messages for better results    
      const lore = DBclient.collections.use("Lore");
    
      const result = await lore.query.nearText(JSON.stringify(rewrittenQuery), {limit: 5});
    
      const systemMessage = {role: "system", content: "Tu peux t'aider des informations fournies pour répondre : "};
    
      for (let object of result.objects) {
          systemMessage.content += (JSON.stringify(object.properties))+" | ";
      };
      console.log(systemMessage);
    
      //add the system message to the messages
      messages = [
          systemMessage,
          ...body.messages,
      ];
      console.log("Query transformation and RAG succeded")
    } catch (err) {
      console.log("Query transformation and RAG search failed : "+err)
    }

//_____________________________________________________________________

    const upstreamRes = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
        messages,
      }),
    });

    const data = await upstreamRes.json();

    return new Response(JSON.stringify(data.choices?.[0]?.message), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

//_____________________________________________________________________

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};