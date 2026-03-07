import { type APIRoute } from "astro";
import { addGamestate, deleteGamestate, getGamestateRAG, getLoreRAG, listCollections, listGamestate } from "../../../../backend/functions/proto/weaviate";
import { createItem } from "../../../../backend/functions/proto/inventory";

export const POST: APIRoute = async ({locals, request}) => {
    try {
        console.log("[testFunction] Testing some function");
        const id = locals.pb.authStore.record?.id;
        if (id) {
            await createItem(id, {name: 'épée', desc: 'une épée tranchante', amount: 1});
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