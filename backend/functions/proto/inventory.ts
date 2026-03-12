import Pocketbase from "pocketbase";
import type { Item } from "./type";
const pb = new Pocketbase("http://127.0.0.1:8090/");

const PB_ADMIN_EMAIL = import.meta.env.PB_ADMIN_EMAIL!;
const PB_ADMIN_PASSWORD = import.meta.env.PB_ADMIN_PASSWORD!;

export async function authAdmin() {
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL,PB_ADMIN_PASSWORD);
}

export async function listInventory(id: string) {
    try {
        await authAdmin();
        const collectionName = "Inventory_"+id;
        const items = await pb.collection(collectionName).getFullList();
        console.log("[listInventory] Listed inventory");
        pb.authStore.clear();
        return items;
    } catch (e) {
        console.log("[listInventory] Failed");
        return e;
    }
}

export async function createItem(id: string, data: Item) {
    try {
        await authAdmin();
        const collectionName = "Inventory_"+id;
        const item = await pb.collection(collectionName).create(data);
        console.log("[createItem] Added item "+data.name);
        pb.authStore.clear();
        return item;
    } catch (e) {
        console.log("[createItem] Failed");
        return e;
    }
}

export async function updateItem(id: string, itemId: string, data: Item) {
    try {
        await authAdmin();
        const collectionName = "Inventory_"+id;
        await pb.collection(collectionName).update(itemId, data);
        console.log("[updateItem] Updated item");
        pb.authStore.clear();
        return;
    } catch (e) {
        console.log("[updateItem] Failed");
        return e;
    }
}

export async function deleteItem(id: string, itemId: string) {
    try {
        await authAdmin();
        const collectionName = "Inventory_"+id;
        await pb.collection(collectionName).delete(itemId);
        console.log("[deleteItem] Deleted item");
        pb.authStore.clear();
        return;
    } catch (e) {
        console.log("[deleteItem] Failed");
        return e;
    }
}