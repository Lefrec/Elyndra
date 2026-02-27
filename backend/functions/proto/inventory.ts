import Pocketbase from "pocketbase";
import type { Item } from "./type";
const pb = new Pocketbase("http://127.0.0.1:8090/");

const PB_ADMIN_EMAIL = import.meta.env.PB_ADMIN_EMAIL!;
const PB_ADMIN_PASSWORD = import.meta.env.PB_ADMIN_PASSWORD!;

export async function authAdmin() {
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL,PB_ADMIN_PASSWORD);
}

export async function listItems(id : string) {
    try {
        const collectionName = "Inventory_"+id;
        const items = await pb.collection(collectionName).getFullList();
        return items;
    } catch (e) {
        console.log("[listItem] Failed");
        return e;
    }
}

export async function createItem(id : string, data : Item) {
    try {
        await authAdmin();
        const collectionName = "Inventory_"+id;
        await pb.collection(collectionName).create(data);
        console.log("[createItem] Added item "+data.name);
        pb.authStore.clear();
        return;
    } catch (e) {
        console.log("[createItem] Failed");
        return e;
    }
}

export async function updateItem(id : string, data : Item) {
    try {
        await authAdmin();
        const collectionName = "Inventory_"+id;
        await pb.collection(collectionName).create(data);
        console.log("[createItem] Added item "+data.name);
        pb.authStore.clear();
        return;
    } catch (e) {
        console.log("[createItem] Failed");
        return e;
    }
}