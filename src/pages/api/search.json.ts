// src/pages/api/search.json.ts
import type { APIRoute } from "astro";
import Perplexity from "@perplexity-ai/perplexity_ai";
import type {
  SearchCreateResponse,
  SearchResult,
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
    const { query } = (await request.json()) as { query?: string };

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing 'query' in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const search: SearchCreateResponse = await client.search.create({
      query,
      max_results: 1,
    });

    return new Response(JSON.stringify(search), {
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