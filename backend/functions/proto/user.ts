import Pocketbase,{ type CollectionModel } from "pocketbase";
const pb = new Pocketbase("http://127.0.0.1:8090/");

const PB_ADMIN_EMAIL = import.meta.env.PB_ADMIN_EMAIL!;
const PB_ADMIN_PASSWORD = import.meta.env.PB_ADMIN_PASSWORD!;

export async function authAdmin() {
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL,PB_ADMIN_PASSWORD);
}

export async function setupCollections(id: string) {
    try {
        const pb = await authAdmin();
        await setupInventory(id);
    }
    catch (e) {
        return e
    }
}

async function setupInventory(id: string) {
    let collection = await pb.collections.delete("Inventory_"+id);
    console.log("[setupInventory]");
    return;
}

