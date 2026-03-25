import { type APIRoute } from "astro";

export const POST: APIRoute = async ({locals, request}) => {
    try {
        console.log("[testFunction] Testing some function");
        return new Response(
            JSON.stringify({ reply: "Test function correctly" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ reply: "There was an error :", error }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};