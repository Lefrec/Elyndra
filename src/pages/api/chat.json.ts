// src/pages/api/search.json.ts
import type { APIRoute } from "astro";
import Perplexity from "@perplexity-ai/perplexity_ai";
import type {
  ChatCompletionMessage,
  ChatMessageInput,
} from "@perplexity-ai/perplexity_ai";

const apiKey = import.meta.env.PERPLEXITY_API_KEY;

if (!apiKey) {
  console.warn("PERPLEXITY_API_KEY is not set");
}

const client = new Perplexity({
  apiKey,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
        messages: ChatMessageInput;
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Body must include a non-empty 'messages' array" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const streamResp = await client.chat.completions.create({
            model: "sonar",
            messages: body.messages,
            stream: true,
            disable_search: true,
          });

          // The SDK's streaming interface depends on the version.
          // This assumes it is an async iterable over chunks with `choices[0].delta.content`.
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