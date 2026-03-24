import { type APIRoute } from "astro";
import { setupCollections } from "../../../../backend/functions/user";

export const POST: APIRoute = async ({locals, request}) => {
    try {
        console.log("[setupCollections]");
        const id = locals.pb.authStore.record?.id;
        if (id) {
            await setupCollections(id);
            return new Response(
                JSON.stringify({ reply: "Collections set up correctly" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        } else {
            return new Response(
                JSON.stringify({ reply: "You must be connected to set up collections" }),
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