import type { APIRoute } from "astro";
import PocketBase from "pocketbase";

const POCKETBASE_URL = import.meta.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

export const POST: APIRoute = ({ cookies }) => {
    const token = cookies.get("elyndra_session")?.value;

    if (token) {
        // Invalider le token côté PocketBase
        const pb = new PocketBase(POCKETBASE_URL);
        pb.authStore.clear();
    }

    cookies.delete("elyndra_session", { path: "/" });
    cookies.delete("elyndra_pseudo", { path: "/" });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
