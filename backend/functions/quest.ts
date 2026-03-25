import Pocketbase from "pocketbase";
import type { Quest } from "./type";
const pb = new Pocketbase(import.meta.env.PB_URL ?? "http://elyndra.paolo-vincent.fr/");

const PB_ADMIN_EMAIL = import.meta.env.PB_ADMIN_EMAIL!;
const PB_ADMIN_PASSWORD = import.meta.env.PB_ADMIN_PASSWORD!;

export async function authAdmin() {
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL,PB_ADMIN_PASSWORD);
}

export async function listQuest(id: string) {
    try {
        await authAdmin();
        const collectionName = "Quest_"+id;
        const quests = await pb.collection(collectionName).getFullList();
        console.log("[listQuest] Listed Quest");
        pb.authStore.clear();
        if (quests.length == 0) {
            return "Quest is empty";
        } else {
            return quests;
        };
    } catch (e) {
        console.log("[listQuest] Failed");
        return e;
    }
}

export async function createQuest(id: string, data: Quest) {
    try {
        await authAdmin();
        const collectionName = "Quest_"+id;
        const quest = await pb.collection(collectionName).create(data);
        console.log("[createQuest] Added quest "+data.name);
        pb.authStore.clear();
        return quest;
    } catch (e) {
        console.log("[createQuest] Failed");
        return e;
    }
}

export async function updateQuest(id: string, questId: string, data: Quest) {
    try {
        await authAdmin();
        const collectionName = "Quest_"+id;
        const quest = await pb.collection(collectionName).update(questId, data);
        console.log("[updateQuest] Updated quest");
        pb.authStore.clear();
        return quest;
    } catch (e) {
        console.log("[updateQuest] Failed");
        return e;
    }
}

export async function deleteQuest(id: string, questId: string) {
    try {
        await authAdmin();
        const collectionName = "Quest_"+id;
        const quest = await pb.collection(collectionName).delete(questId);
        console.log("[deleteQuest] Deleted quest");
        pb.authStore.clear();
        return `Quest was deleted successfuly : ${quest}`;
    } catch (e) {
        console.log("[deleteQuest] Failed");
        return e;
    }
}