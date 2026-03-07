import type { APIRoute } from "astro";
import PocketBase from "pocketbase";

const POCKETBASE_URL = import.meta.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

export const POST: APIRoute = async ({ request, cookies }) => {
    const token = cookies.get("elyndra_session")?.value;
    if (!token) {
        return new Response(JSON.stringify({ error: "Non authentifié" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const body = await request.json().catch(() => null);
    if (!body?.biome || !body?.messages) {
        return new Response(JSON.stringify({ error: "Données manquantes" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token, null);

    try {
        await pb.collection("users").authRefresh();
        const userId = pb.authStore.record?.id;

        if (!userId) {
            return new Response(JSON.stringify({ error: "Impossible de récupérer l'identifiant utilisateur" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Chercher une sauvegarde existante pour ce joueur + biome
        const existing = await pb
            .collection("game_saves")
            .getFirstListItem(`user="${userId}" && biome="${body.biome}"`)
            .catch(() => null);

        if (existing) {
            await pb.collection("game_saves").update(existing.id, {
                messages: JSON.stringify(body.messages),
                role: body.role ?? existing.role,
            });
        } else {
            await pb.collection("game_saves").create({
                user: userId,
                biome: body.biome,
                role: body.role ?? "",
                messages: JSON.stringify(body.messages),
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch {
        return new Response(JSON.stringify({ error: "Erreur lors de la sauvegarde" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
