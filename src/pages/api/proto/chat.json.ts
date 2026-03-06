import { type APIRoute } from "astro";

//get API key and URL
const API_KEY = import.meta.env.LABAI_API_KEY;
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";

//we keep the system prompt out of the POST for readability
const systemPrompt: string = "Tu es un assistant IA, répond aux requêtes de l'utilisateur de la manière la plus simple et directe possible.";

export const POST: APIRoute = async ({locals, request}) => {
    try {
        console.log("[chat] Chatting ...");
        const id = locals.pb.authStore.record?.id;
        if (id) {
            //getting the messages
            const {messages} = await request.json() as {
                messages: Array<{ role: string, content: string}>
            };

            //basic check
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                console.log("[chat] Messages failed basic check");
                return new Response(
                    JSON.stringify({ error: "Body must include a non-empty 'messages' array" }),
                    { status: 400, headers: { "Content-Type": "application/json" } },
                );
            };
            console.log("[chat] Messages passed basic check");

            let chatMessages: Array<{ role: string; content: string }> = [
                { role: "system", content: systemPrompt },
                ...messages,
            ];

            //request to LLM API
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
                    messages: chatMessages,
                }),
            });

            //getting response content
            const data = await res.json();
            const choice = data[0] ?? data.choices?.[0];
            const content = choice?.message?.content as string | undefined;

            console.log("[chat] Content of response : ",content);

            //Response if everything went right
            return new Response(
                JSON.stringify({ reply: content }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        } else {
            //Response if not connected
            return new Response(
                JSON.stringify({ reply: "You must be connected to chat" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }
    } catch (error) {
        //Response if things went wrong
        return new Response(
            JSON.stringify({ reply: "There was an error :", error }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};