import type { APIRoute } from "astro";
import { setupCollections } from "../../../../backend/functions/proto/user";

export const POST: APIRoute = async ({request}) => {
    try {
        console.log("[setupCollections]");
        await setupCollections("zzegnoy4tcj8qpt");
        return new Response(
            JSON.stringify({ reply: "Collections set up correctly" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ reply: "There was an error :", error }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};