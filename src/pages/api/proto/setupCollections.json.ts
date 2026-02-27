import { type APIRoute } from "astro";
import { setupCollections } from "../../../../backend/functions/proto/user";
import { createItem } from "../../../../backend/functions/proto/inventory";

export const POST: APIRoute = async ({locals, request}) => {
    try {
        console.log("[setupCollections]");
        const id = locals.pb.authStore.record.id;
        await setupCollections(id);
        await createItem(id,{name: "test", desc: "This is a test", amount: 100});
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