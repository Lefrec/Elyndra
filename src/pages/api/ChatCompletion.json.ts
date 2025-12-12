import type { APIRoute } from "astro";
import Perplexity from "@perplexity-ai/perplexity_ai";
import type { ChatCompletionMessage, ChatMessageInput } from "@perplexity-ai/perplexity_ai";
import weaviate, { type WeaviateClient } from 'weaviate-client';

//get API key
const apiKey = import.meta.env.PERPLEXITY_API_KEY;

//throw error if API key not found
if (!apiKey) {
  console.warn("PERPLEXITY_API_KEY is not set");
}

//connecet to the perplexity API
const client = new Perplexity({
  apiKey,
});

//connect to the local Weaviate DB
const DBclient: WeaviateClient = await weaviate.connectToLocal();

export const POST: APIRoute = async ({ request }) => {
  try {
    //get the body, should have a messages property that is an array of objects
    const body = (await request.json()) as {
        messages: ChatMessageInput;
    }

    //basic check that throw error if not met
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Body must include a non-empty 'messages' array" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let messagesWithRAG: ChatCompletionMessage[]
    //THE WHOLE QUERY TRANSFORM AND RAG IS IN ITS OWN TRY CATCH FOR SAFETY PURPOSE
    try {
        //QUERY TRANSFORMATION
        //we give the last few messages to the llm and tell it to rewrite them into a proper search query for the DB
        const recentMessages = body.messages.slice(-6);
        //removing the first message if it has the role assistant
        if (recentMessages[0].role == "assistant" || recentMessages[0].role == "system") {
            recentMessages.splice(0, 1);
        };
        //creating the messages array for query transformation
        const rewriteMessages: ChatCompletionMessage[] = [
          {
            role: "system",
            content: "Ton rôle est de réécrire le dernier message de l'utilisateur en une requête simple, très courte et concise et claire destinée à une base de donnée vectorielle de lore du monde. La requête doit fonctionner seule avec tous les noms et références explicites nécessaires. Retourne uniquement la requête."
          },
          ...recentMessages,
        ]
        //get the response from the llm
        const rewriteCompletion = await client.chat.completions.create({
        model: "sonar",
        messages: rewriteMessages,
        disable_search: true,
        })
        const rewrittenQuery = rewriteCompletion.choices[0].message.content;
        console.log("successfully rewritten query : " + rewrittenQuery);

        //RAG
        //we search for relevant elements in the database and add them to the messages for better results
        // var exists = await DBclient.collections.exists("Lore");
        // console.log("Collection Lore exists : "+exists);

        const lore = DBclient.collections.use("Lore");

        const result = await lore.query.nearText(JSON.stringify(rewrittenQuery), {limit: 5});

        const systemMessage = {role: "system", content: "Tu peux t'aider des informations fournies pour répondre : "};

        for (let object of result.objects) {
            systemMessage.content += (JSON.stringify(object.properties))+" | ";
        };
        console.log(systemMessage);

        //add the system message to the messages
        messagesWithRAG = [
            systemMessage,
            ...body.messages,
        ];
        console.log("Query transformation and RAG succeded")
    } catch (err) {
        console.log("Query transformation and RAG search failed : "+err)
    }

    //CHAT COMPLETION
    //finally we get the chat completion for the conversation
    //we use a streaming response to show the response being written in real time
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const streamResp = await client.chat.completions.create({
            model: "sonar",
            messages: messagesWithRAG ||body.messages,
            stream: true,
            disable_search: true,
          });

          for await (const chunk of streamResp as any) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.enqueue(encoder.encode("\n[STREAM_ERROR]"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};