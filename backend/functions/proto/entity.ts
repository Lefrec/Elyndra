import Pocketbase from "pocketbase";
import type { Entity } from "./type";
const pb = new Pocketbase("http://127.0.0.1:8090/");

const PB_ADMIN_EMAIL = import.meta.env.PB_ADMIN_EMAIL!;
const PB_ADMIN_PASSWORD = import.meta.env.PB_ADMIN_PASSWORD!;

export async function authAdmin() {
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL,PB_ADMIN_PASSWORD);
}

export async function listEntity(id: string) {
    try {
        await authAdmin();
        const collectionName = "Entity_"+id;
        const entities = await pb.collection(collectionName).getFullList();
        console.log("[listEntity] Listed entity");
        pb.authStore.clear();
        if (entities.length == 0) {
            return "Entity is empty";
        } else {
            return entities;
        };
    } catch (e) {
        console.log("[listEntity] Failed");
        return e;
    }
}

export async function createEntity(id: string, data: Entity) {
    try {
        await authAdmin();
        const collectionName = "Entity_"+id;
        const entity = await pb.collection(collectionName).create(data);
        console.log("[createEntity] Added entity "+data.name);
        pb.authStore.clear();
        return entity;
    } catch (e) {
        console.log("[createEntity] Failed");
        return e;
    }
}

export async function updateEntity(id: string, entityId: string, data: Entity) {
    try {
        await authAdmin();
        const collectionName = "Entity_"+id;
        const entity = await pb.collection(collectionName).update(entityId, data);
        console.log("[updateEntity] Updated entity");
        pb.authStore.clear();
        return entity;
    } catch (e) {
        console.log("[updateEntity] Failed");
        return e;
    }
}

export async function deleteEntity(id: string, entityId: string) {
    try {
        await authAdmin();
        const collectionName = "Entity_"+id;
        const entity = await pb.collection(collectionName).delete(entityId);
        console.log("[deleteEntity] Deleted entity");
        pb.authStore.clear();
        return `Entity was deleted successfuly : ${entity}`;
    } catch (e) {
        console.log("[deleteEntity] Failed");
        return e;
    }
}