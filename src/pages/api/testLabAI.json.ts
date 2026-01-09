import type { APIRoute } from "astro";

//get API key
const API_KEY = import.meta.env.LABAI_API_KEY;
//get API URL
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";

//throw error if API key or URL not found
if (!API_KEY) {
  console.warn("LABAI_API_KEY is not set");
}

if (!API_URL) {
    console.warn("API URL not set");
}

export const POST: APIRoute = async ({ request }) => {
  try {
    //get the body, should have a messages property that is an array of objects
    const body = await request.json() as {
        messages? : { role: string; content: string }[];
    }

    const messages = body.messages;
    
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