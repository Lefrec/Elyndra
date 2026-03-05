import { type APIRoute } from "astro";
import { deleteCollections } from "../../../../backend/functions/proto/user";

export const POST: APIRoute = async ({locals, request}) => {
    try {
        console.log("[deleteCollections]");
        const id = locals.pb.authStore.record?.id;
        if (id) {
            await deleteCollections(id);
            return new Response(
                JSON.stringify({ reply: "Collections deleted correctly" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        } else {
            return new Response(
                JSON.stringify({ reply: "You must be connected to delete collections" }),
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