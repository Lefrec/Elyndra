import { defineMiddleware } from "astro:middleware";
import PocketBase from "pocketbase";

const POCKETBASE_URL = import.meta.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

function getUserIdFromToken(token: string): string | null {
    try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
        return payload.id ?? null;
    } catch {
        return null;
    }
}

// Routes nécessitant une authentification
const PROTECTED_ROUTES = [
    "/interface_jeu",
    "/choixbiome",
    "/start_game",
];

export const onRequest = defineMiddleware(async ({ cookies, url, redirect, locals }, next) => {
    const isProtected = PROTECTED_ROUTES.some(route =>
        url.pathname.startsWith(route)
    );

    if (isProtected) {
        const token = cookies.get("elyndra_session")?.value;

        if (!token) {
            return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
        }

        // Vérifier le token auprès de PocketBase
        const pb = new PocketBase(POCKETBASE_URL);
        pb.authStore.save(token, null);

        try {
            await pb.collection("users").authRefresh();
            // Rendre l'utilisateur disponible dans toutes les pages
            (locals as Record<string, unknown>).user = pb.authStore.record;
        } catch {
            // Token expiré ou invalide → on renvoie vers le login
            cookies.delete("elyndra_session", { path: "/" });
            return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
        }
    }

    return next();
});
