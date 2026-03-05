import { type APIRoute } from "astro";
import { addGamestate, deleteGamestate, listCollections, listGamestate } from "../../../../backend/functions/proto/gamestate";

export const POST: APIRoute = async ({locals, request}) => {
    try {
        console.log("[testFunction]");
        const id = locals.pb.authStore.record?.id;
        if (id) {
            await deleteGamestate(id);
            return new Response(
                JSON.stringify({ reply: "Test function correctly" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        } else {
            return new Response(
                JSON.stringify({ reply: "You must be connected" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }
    } catch (error) {
        return new Response(
            JSON.stringify({ reply: "There was an error :", error }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};