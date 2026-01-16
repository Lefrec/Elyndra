import Pocketbase from "pocketbase";
const pb = new Pocketbase("http://127.0.0.1:8090/");

//list the records in Inventory
export async function listInventory() {
    try {
        console.log("[listInventory")
    } catch {
        console.log("[listInventory] Failed to list inventory")
        return error
    }
}