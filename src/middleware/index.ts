import pb from 'pocketbase';

import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware(async ({locals, request, isPrerendered}:any, next: ()=> any) => {

    console.log("[middleware]");

    locals.pb = new pb("http://elyndra.paolo-vincent.fr/");

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