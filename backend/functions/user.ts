import Pocketbase from 'pocketbase';
import type { TypedPocketBase } from '../../src/utils/type.ts';
import { deleteGamestateCol, setupGamestate } from './weaviate.ts';
const pb = new Pocketbase(import.meta.env.PB_URL ?? "http://elyndra.paolo-vincent.fr/") as TypedPocketBase;

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
        // await setupEntity(id);
        await setupQuest(id);
        await setupGamestate(id);
        await clearSave(id);
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
        // await deleteEntity(id);
        await deleteQuest(id);
        await deleteGamestateCol(id);
        await clearSave(id);
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
                listRule:   "",
                viewRule:   "",
                createRule: "",
                updateRule: "",
                deleteRule: "",
                fields: [
                    {
                        name: "name",
                        type: "text",
                    },
                    {
                        name: "class",
                        type: "select",
                        values: ["chevalier","mage","chimiste","ombre"],
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
            console.log("[setupPlayer] Retiring old characters");
            const currentPlayers = await pb.collection(collectionName).getFullList();
            currentPlayers.forEach( async (player) => {
                await pb.collection(collectionName).update(player.id, {isCurrent: false});
            });
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
                listRule:   "",
                viewRule:   "",
                createRule: "",
                updateRule: "",
                deleteRule: "",
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

// async function setupEntity(id: string) {
//     try {
//         const collectionName : string = "Entity_"+id;
//         const doesExist : boolean = await checkCollection(collectionName);

//         //logic executed if the collection doesn't exist
//         if (!doesExist) {
//             console.log("[setupEntity] Create collection");
//             await pb.collections.create({
//                 type: "base",
//                 name: collectionName,
//                 fields: [
//                     {
//                         name: "name",
//                         type: "text",
//                     },
//                     {
//                         name: "desc",
//                         type: "text",
//                     },
//                     {
//                         name: "maxHP",
//                         type: "number",
//                     },
//                     {
//                         name: "currentHP",
//                         type: "number",
//                     },
//                 ]
//             })
//         } else {
//             console.log("[setupEntity] Truncate collection");
//             await pb.collections.truncate(collectionName)
//         }

//         return;
//     } catch (e) {
//         console.log("[setupEntity] Failed")
//         return e;
//     }
// }

// async function deleteEntity(id: string) {
//     try {
//         const collectionName : string = "Entity_"+id;
//         const doesExist : boolean = await checkCollection(collectionName);

//         if (!doesExist) {
//             console.log("[deleteEntity] Collection doesn't exist");
//         } else {
//             await pb.collections.delete(collectionName);
//             console.log("[deleteEntity] Deleted collection");
//         }

//         return;
//     } catch (e) {
//         console.log("[deleteEntity] Failed")
//         return e;
//     }
// }

async function setupQuest(id: string) {
    try {
        const collectionName : string = "Quest_"+id;
        const doesExist : boolean = await checkCollection(collectionName);

        //logic executed if the collection doesn't exist
        if (!doesExist) {
            console.log("[setupQuest] Create collection");
            await pb.collections.create({
                type: "base",
                name: collectionName,
                listRule:   "",
                viewRule:   "",
                createRule: "",
                updateRule: "",
                deleteRule: "",
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
                        name: "completed",
                        type: "bool",
                    },
                ]
            })
        } else {
            console.log("[setupQuest] Truncate collection");
            await pb.collections.truncate(collectionName)
        }

        return;
    } catch (e) {
        console.log("[setupQuest] Failed")
        return e;
    } 
}

async function deleteQuest(id: string) {
    try {
        const collectionName : string = "Quest_"+id;
        const doesExist : boolean = await checkCollection(collectionName);

        if (!doesExist) {
            console.log("[deleteQuest] Collection doesn't exist");
        } else {
            await pb.collections.delete(collectionName);
            console.log("[deleteQuest] Deleted collection");
        }

        return;
    } catch (e) {
        console.log("[deleteQuest] Failed")
        return e;
    }
}

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

export async function saveMessages(id: string, messages: Array<{ role: string, content: string}>) {
    try {
        const doesExist = await pb.collection("Save").getFullList({filter: `user = '${id}'`});
        if (doesExist.length != 0) {
            await pb.collection("Save").update(doesExist[0].id, {messages});
        } else {
            await pb.collection("Save").create({user: id, messages});
        }
    } catch (e) {
        console.log("[saveMessages] Failed",e);
        return e;
    }
}

async function clearSave(id: string) {
     try {
        const collectionName : string = "Player_"+id;
        const doesExist = await pb.collection("Save").getFullList({ filter: `user = '${id}'` });
        //logic executed if the collection doesn't exist
        if (doesExist) {
            console.log("[clearSave] Killing existing saves")
            doesExist.forEach(async (col) => {
                await pb.collection("Save").delete(col.id);
            })
        }
        return;
    } catch (e) {
        console.log("[clearSave] Failed")
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