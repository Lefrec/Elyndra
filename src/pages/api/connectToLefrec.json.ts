import type { APIRoute } from "astro";
import { connectToLefrec } from "../../../backend/functions/user";

export const POST: APIRoute = async ({request}) => {
    try {
        const authData = await connectToLefrec();
        return new Response(
            JSON.stringify({ reply: "Connected to Lefrec" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ reply: "There was an error :", error }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};