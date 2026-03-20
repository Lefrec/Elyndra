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
    "/start_game",
    "/profile",
];

export const onRequest = defineMiddleware(async ({locals, request, isPrerendered}:any, next: ()=> any) => {

    console.log("[middleware]");

    locals.pb = new pb("http://127.0.0.1:8090");

    if (!isPrerendered) {
        locals.pb.authStore.loadFromCookie(request.headers.get('cookie')||'');
        
        try {
            locals.pb.authStore.isValid && await locals.pb.collection('users').authRefresh();
        } catch (error) {
            locals.pb.authStore.clear();
        }
    }

    const response = await next();

    if (!isPrerendered) {
        response.headers.append('set-cookie', locals.pb.authStore.exportToCookie());
    }

    return response;
})