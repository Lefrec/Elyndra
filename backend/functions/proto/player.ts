import Pocketbase from "pocketbase";
import type { Player } from "./type";
const pb = new Pocketbase("http://127.0.0.1:8090/");

const PB_ADMIN_EMAIL = import.meta.env.PB_ADMIN_EMAIL!;
const PB_ADMIN_PASSWORD = import.meta.env.PB_ADMIN_PASSWORD!;

export async function authAdmin() {
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL,PB_ADMIN_PASSWORD);
}

export async function listPlayer(id: string) {
    try {
        await authAdmin();
        const collectionName = "Player_"+id;
        const players = await pb.collection(collectionName).getFullList();
        console.log("[listPlayer] Listed player");
        pb.authStore.clear();
        return players;
    } catch (e) {
        console.log("[listPlayer] Failed");
        return e;
    }
}

export async function getPlayer(id: string) {
    try {
        await authAdmin();
        const collectionName = "Player_"+id;
        const player = await pb.collection(collectionName).getFullList({filter: "isCurrent = true"});
        if (player.length > 1) {
            console.log("[getPlayer] More than 1 current player");
            pb.authStore.clear();
            return;
        } else {
            console.log(player[0]);
            pb.authStore.clear();
            return player[0];
        }
    } catch (e) {
        console.log("[getPlayer] Failed");
        return e;
    }
}

export async function createPlayer(id: string, data: Player) {

}