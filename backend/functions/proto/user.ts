import Pocketbase from "pocketbase";
import { deleteGamestate, setupGamestate } from "./weaviate";
const pb = new Pocketbase("http://127.0.0.1:8090/");

const PB_ADMIN_EMAIL = import.meta.env.PB_ADMIN_EMAIL!;
const PB_ADMIN_PASSWORD = import.meta.env.PB_ADMIN_PASSWORD!;

async function authAdmin() {
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL,PB_ADMIN_PASSWORD);
}

export async function setupCollections(id: string) {
    try {
        await authAdmin();
        await setupPlayer(id);
        await setupInventory(id);
        await setupEntity(id);
        await setupGamestate(id);
        pb.authStore.clear();
        return;
    } catch (e) {
        console.log("[setupCollections] Failed")
        return e;
    }
}

export async function deleteCollections(id: string) {
    try {
        await authAdmin();
        await deletePlayer(id);
        await deleteInventory(id);
        await deleteEntity(id);
        await deleteGamestate(id);
        pb.authStore.clear();
        return;
    } catch (e) {
        console.log("[deleteCollections] Failed")
        return e;
    }
}

async function setupPlayer(id: string) {
    try {
        const collectionName : string = "Player_"+id;
        const doesExist : boolean = await checkCollection(collectionName);

        //logic executed if the collection doesn't exist
        if (!doesExist) {
            console.log("[setupPlayer] Create collection");
            await pb.collections.create({
                type: "base",
                name: collectionName,
                fields: [
                    {
                        name: "name",
                        type: "text",
                    },
                    {
                        name: "class",
                        type: "select",
                        values: ["chevalier","mage","alchimiste","ombre"],
                    },
                    {
                        name: "maxHP",
                        type: "number",
                    },
                    {
                        name: "currentHP",
                        type: "number",
                    },
                    {
                        name: "for",
                        type: "number",
                    },
                    {
                        name: "def",
                        type: "number",
                    },
                    {
                        name: "mag",
                        type: "number",
                    },
                    {
                        name: "agi",
                        type: "number",
                    },
                    {
                        name: "isCurrent",
                        type: "bool",
                    },
                ]
            })
        } else {
            console.log("[setupPlayer] Truncate collection");
            await pb.collections.truncate(collectionName)
        }

        return;
    } catch (e) {
        console.log("[setupPlayer] Failed")
        return e;
    }
}

async function deletePlayer(id: string) {
    try {
        const collectionName : string = "Player_"+id;
        const doesExist : boolean = await checkCollection(collectionName);

        if (!doesExist) {
            console.log("[deletePlayer] Collection doesn't exist");
        } else {
            await pb.collections.delete(collectionName);
            console.log("[deletePlayer] Deleted collection");
        }

        return;
    } catch (e) {
        console.log("[deletePlayer] Failed")
        return e;
    }
}

async function setupInventory(id: string) {
    try {
        const collectionName : string = "Inventory_"+id;
        const doesExist : boolean = await checkCollection(collectionName);

        //logic executed if the collection doesn't exist
        if (!doesExist) {
            console.log("[setupInventory] Create collection");
            await pb.collections.create({
                type: "base",
                name: collectionName,
                fields: [
                    {
                        name: "name",
                        type: "text",
                    },
                    {
                        name: "desc",
                        type: "text",
                    },
                    {
                        name: "amount",
                        type: "number",
                    },
                ]
            })
        } else {
            console.log("[setupInventory] Truncate collection");
            await pb.collections.truncate(collectionName)
        }

        return;
    } catch (e) {
        console.log("[setupInventory] Failed")
        return e;
    }
}

async function deleteInventory(id: string) {
    try {
        const collectionName : string = "Inventory_"+id;
        const doesExist : boolean = await checkCollection(collectionName);

        if (!doesExist) {
            console.log("[deleteInventory] Collection doesn't exist");
        } else {
            await pb.collections.delete(collectionName);
            console.log("[deleteInventory] Deleted collection");
        }

        return;
    } catch (e) {
        console.log("[deleteInventory] Failed")
        return e;
    }
}

async function setupEntity(id: string) {
    try {
        const collectionName : string = "Entity_"+id;
        const doesExist : boolean = await checkCollection(collectionName);

        //logic executed if the collection doesn't exist
        if (!doesExist) {
            console.log("[setupEntity] Create collection");
            await pb.collections.create({
                type: "base",
                name: collectionName,
                fields: [
                    {
                        name: "name",
                        type: "text",
                    },
                    {
                        name: "desc",
                        type: "text",
                    },
                    {
                        name: "currentHP",
                        type: "number",
                    },
                ]
            })
        } else {
            console.log("[setupEntity] Truncate collection");
            await pb.collections.truncate(collectionName)
        }

        return;
    } catch (e) {
        console.log("[setupEntity] Failed")
        return e;
    }
}

async function deleteEntity(id: string) {
    try {
        const collectionName : string = "Entity_"+id;
        const doesExist : boolean = await checkCollection(collectionName);

        if (!doesExist) {
            console.log("[deleteEntity] Collection doesn't exist");
        } else {
            await pb.collections.delete(collectionName);
            console.log("[deleteEntity] Deleted collection");
        }

        return;
    } catch (e) {
        console.log("[deleteEntity] Failed")
        return e;
    }
}

//helper returning a boolean value based on if a collection exist or not given its name
async function checkCollection(collectionName : string) : Promise<boolean> {
    try {
        await pb.collections.getOne(collectionName);
        return true;
    } catch {
        return false;
    }
}