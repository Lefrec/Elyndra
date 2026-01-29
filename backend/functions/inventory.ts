import Pocketbase from "pocketbase";
const pb = new Pocketbase("http://127.0.0.1:8090/");

//Basic functions to test tools interacting with inventory in PocketBase

//get all inventory items
export async function listInventory() {
    try {
        console.log("[listInventory] Fetching all inventory items");
        
        const inventory = pb.collection('Inventory');
        const items = await inventory.getFullList();
        
        console.log("[listInventory] Found " + items.length + " items");
        return items;
    } catch (error) {
        console.log("[listInventory] Failed to list inventory: " + error);
        throw error;
    }
}

//get single inventory item by ID
export async function getItem(itemId : string) {
    try {
        console.log("[getItem] Fetching item: " + itemId);
        
        const inventory = pb.collection('Inventory');
        const item = await inventory.getOne(itemId);
        
        console.log("[getItem] Found item: " + item.name);
        return item;
    } catch (error) {
        console.log("[getItem] Failed to fetch item: " + error);
        throw error;
    }
}

//create new inventory item
export async function createItem(name: string, desc: string, amount: number) {
    try {
        console.log("[createItem] Creating item: " + name);
        
        const inventory = pb.collection('Inventory');
        const newItem = await inventory.create({
            name: name,
            desc: desc,
            amount: amount,
        });
        
        console.log("[createItem] Item created with ID: " + newItem.id);
        return newItem;
    } catch (error) {
        console.log("[createItem] Failed to create item: " + error);
        throw error;
    }
}

//update inventory item
export async function updateItem(itemId: string, name: string, desc: string, amount: number) {
    try {
        console.log("[updateItem] Updating item " + itemId);
        
        const inventory = pb.collection('Inventory');
        const updatedItem = await inventory.update(itemId, {
            name: name,
            desc: desc,
            amount: amount,
        });
        
        console.log("[updateItem] Item updated successfully");
        return updatedItem;
    } catch (error) {
        console.log("[updateItem] Failed to update item: " + error);
        throw error;
    }
}

//delete inventory item
export async function deleteItem(itemId: string) {
    try {
        console.log("[deleteItem] Deleting item: " + itemId);
        
        const inventory = pb.collection('Inventory');
        await inventory.delete(itemId);
        
        console.log("[deleteItem] Item deleted successfully");
        return true;
    } catch (error) {
        console.log("[deleteItem] Failed to delete item: " + error);
        throw error;
    }
}