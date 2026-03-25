import Pocketbase from "pocketbase";
import type { Player } from "./type";
const pb = new Pocketbase(import.meta.env.PB_URL ?? "http://elyndra.paolo-vincent.fr/");

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
    try {
        await authAdmin();
        const collectionName = "Player_"+id;
        const player = await pb.collection(collectionName).create(data);
        console.log("[createPlayer] Added player "+data.name);
        pb.authStore.clear();
        return player;
    } catch (e) {
        console.log("[createPlayer] Failed");
        return e;
    }
}

export async function updatePlayer(id: string, playerId: string, data: Player) {
    try {
        await authAdmin();
        const collectionName = "Player_"+id;
        const player = await pb.collection(collectionName).update(playerId, data);
        console.log("[updatePlayer] Updated player");
        pb.authStore.clear();
        return player;
    } catch (e) {
        console.log("[updatePlayer] Failed");
        return e;
    }
}

export async function deletePlayer(id: string, playerId: string) {
    try {
        await authAdmin();
        const collectionName = "Player_"+id;
        const player = await pb.collection(collectionName).delete(playerId);
        console.log("[deletePlayer] Deleted player");
        pb.authStore.clear();
        return `Item was deleted successfuly : ${player}`;
    } catch (e) {
        console.log("[deletePlayer] Failed");
        return e;
    }
}