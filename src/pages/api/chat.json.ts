// src/pages/api/search.json.ts
import type { APIRoute } from "astro";
import Perplexity from "@perplexity-ai/perplexity_ai";
import type {
  ChatCompletionCreateResponse,
  ChatCompletionMessage,
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
        messages?: ChatCompletionMessage[];
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Body must include a non-empty 'messages' array" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const completion: ChatCompletionCreateResponse = await client.chat.completions.create({
        model: "sonar-pro",
        messages: body.messages,
    });

    const choice = completion.choices?.[0];
    const reply = choice?.message;

    if (!reply) {
      return new Response(
        JSON.stringify({ error: "No reply from model" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        message: reply,
        usage: completion.usage,
        id: completion.id,
        model: completion.model,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};