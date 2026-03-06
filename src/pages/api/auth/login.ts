import type { APIRoute } from "astro";
import PocketBase from "pocketbase";

const POCKETBASE_URL = import.meta.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

// Durée de session : 7 jours
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const POST: APIRoute = async ({ request, cookies }) => {
    const body = await request.json().catch(() => null);

    if (!body?.email || !body?.password) {
        return new Response(JSON.stringify({ error: "Email et mot de passe requis." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const pb = new PocketBase(POCKETBASE_URL);

    try {
        const authData = await pb.collection("users").authWithPassword(
            body.email as string,
            body.password as string
        );

        // Stocker le token PocketBase dans le cookie de session
        cookies.set("elyndra_session", authData.token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_MAX_AGE,
        });

        // Stocker le pseudo dans un cookie lisible (non httpOnly)
        const pseudo = (authData.record as Record<string, unknown>)?.pseudo as string ?? "";
        cookies.set("elyndra_pseudo", pseudo, {
            httpOnly: false,
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_MAX_AGE,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch {
        return new Response(JSON.stringify({ error: "Email ou mot de passe incorrect." }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
};
