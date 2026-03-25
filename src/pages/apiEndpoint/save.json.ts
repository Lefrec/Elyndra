import { type APIRoute } from "astro";
import { saveMessages } from "../../../backend/functions/user";

export const POST: APIRoute = async ({ locals, request }) => {
    try {
        const {messages} = await request.json() as {
            messages: Array<{ role: string, content: string}>
        };
        const id = locals.pb.authStore.record?.id;
        if (id) {
            await saveMessages(id, messages);

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
      console.error("[save]", error);
      return new Response(
        JSON.stringify({ reply: "There was an error", error: error?.message ?? String(error) }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
};