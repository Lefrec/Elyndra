import Pocketbase,{ type CollectionModel } from "pocketbase";
const pb = new Pocketbase("http://127.0.0.1:8090/");

const PB_ADMIN_EMAIL = import.meta.env.PB_ADMIN_EMAIL!;
const PB_ADMIN_PASSWORD = import.meta.env.PB_ADMIN_PASSWORD!;

export async function authAdmin() {
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL,PB_ADMIN_PASSWORD);
}

export async function setupCollections(id: string) {
    try {
        await authAdmin();
        await setupPlayer(id);
        await setupInventory(id);
        await setupEntity(id);
        pb.authStore.clear();
        return;
    } catch (e) {
        console.log("[setupCollections] Failed")
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
                        values: ["knight","mage"],
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
                        name: "str",
                        type: "number",
                    },
                    {
                        name: "dex",
                        type: "number",
                    },
                    {
                        name: "con",
                        type: "number",
                    },
                    {
                        name: "int",
                        type: "number",
                    },
                    {
                        name: "isCurrent",
                        type: "bool",
                    },
                ]
            })
        }

        return;
    } catch (e) {
        console.log("[setupPlayer] Failed")
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

//helper returning a boolean value based on if a collection exist or not given its name
async function checkCollection(collectionName : string) : Promise<boolean> {
    try {
        await pb.collections.getOne(collectionName);
        return true;
    } catch {
        return false;
    }
}