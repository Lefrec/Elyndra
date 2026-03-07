import type { APIRoute } from "astro";
import PocketBase from "pocketbase";

const POCKETBASE_URL = import.meta.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

export const GET: APIRoute = async ({ url, cookies }) => {
    const token = cookies.get("elyndra_session")?.value;
    if (!token) {
        return new Response(JSON.stringify({ error: "Non authentifié" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const biome = url.searchParams.get("biome");
    if (!biome) {
        return new Response(JSON.stringify({ error: "Biome manquant" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token, null);

    try {
        await pb.collection("users").authRefresh();
        const userId = pb.authStore.record?.id;

        const save = await pb
            .collection("game_saves")
            .getFirstListItem(`user="${userId}" && biome="${biome}"`)
            .catch(() => null);

        if (!save) {
            return new Response(JSON.stringify({ save: null }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(
            JSON.stringify({
                save: {
                    biome: save.biome,
                    role: save.role,
                    messages: JSON.parse(save.messages),
                },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch {
        return new Response(JSON.stringify({ save: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
};
