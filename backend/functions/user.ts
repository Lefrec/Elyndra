import Pocketbase from 'pocketbase';
import type { TypedPocketBase } from '../../src/utils/type';
const pb = new Pocketbase("https://sae401.paolo-vincent.fr/") as TypedPocketBase;

export async function getUser(id: string) : Promise<Object | undefined> {
    try {
        const user = await pb.collection("users").getOne(id);

        console.log("[getUser] Got user :",JSON.stringify(user, null, 2));

        return user;
    } catch (e) {
        console.log("[getUser] Failed to get user :",id,"Caught error :",e);
        return;
    }
}