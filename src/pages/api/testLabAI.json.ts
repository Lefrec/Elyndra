import type { APIRoute } from "astro";
import weaviate, { type WeaviateClient } from 'weaviate-client';

//get API key and URL
const API_KEY = import.meta.env.LABAI_API_KEY;
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";
if (!API_KEY) {
  console.warn("LABAI_API_KEY is not set");
}
if (!API_URL) {
    console.warn("API URL not set");
}

//connect to local Weaviate DB
const DBclient: WeaviateClient = await weaviate.connectToLocal();


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

    //THE WHOLE QUERY TRANSFORM AND RAG IS IN ITS OWN TRY CATCH FOR SAFETY PURPOSE
        try {
            //QUERY TRANSFORMATION
            //we give the last few messages to the llm and tell it to rewrite them into a proper search query for the DB
            const recentMessages = body.messages.slice(-6);
            //removing the first messages if they have the role assistant or system
            while (recentMessages[0].role == "assistant" || recentMessages[0].role == "system") {
              recentMessages.splice(0,1);
            }
            //creating the messages array for query transformation
            const rewriteMessages: { role: string; content: string }[] = [
              {
                role: "system",
                content: "Ton rôle est de réécrire le dernier message de l'utilisateur en une requête simple, courte et claire destinée à une base de donnée vectorielle de lore du monde. La requête doit fonctionner seule avec tous les noms et références explicites nécessaires. Retourne uniquement la requête."
              },
              ...recentMessages,
            ]
            //get the response from the llm
            const rewriteCompletion = await fetch(API_URL, {
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
            const rewrittenQuery = rewriteCompletion.json.choices[0].message.content;
            console.log("successfully rewritten query : " + rewrittenQuery);
    
            //RAG
            //we search for relevant elements in the database and add them to the messages for better results
            var exists = await DBclient.collections.exists("Lore");
            console.log("Collection Lore exists : "+exists);
    
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

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      return new Response(
        JSON.stringify({ error: "Upstream error", status: upstreamRes.status, details: text }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await upstreamRes.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};