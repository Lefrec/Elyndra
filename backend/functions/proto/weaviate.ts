import weaviate, { type WeaviateClient, dataType, vectors } from 'weaviate-client';
import type { Gamestate } from './type';

export async function listCollections() {
    try {
        const client: WeaviateClient = await weaviate.connectToLocal();
        const allCollections = await client.collections.listAll();
        allCollections.forEach((collection) => {
            console.log("[listCollections] Collection found : ",collection.name);
        })
        await client.close();
        return;
    } catch (e) {
        console.log("[listCollections] Failed");
        return e;
    }
}

export async function setupGamestate(id: string) {
    try {
        const client: WeaviateClient = await weaviate.connectToLocal();
        const gamestate = await client.collections.create({
            name: 'Gamestate_'+id,
            vectorizers: vectors.text2VecOllama({
                apiEndpoint: 'http://ollama:11434',
                model: 'nomic-embed-text',
            }),
            properties: [
                {
                    name: 'type',
                    dataType: dataType.TEXT,
                },
                {
                   name: 'name',
                   dataType: dataType.TEXT,
                },
                {
                    name: 'desc',
                   dataType: dataType.TEXT,
                },
            ]
        });
        console.log("[setupGamestate] Gamestate collection set up");
        await client.close();
        return;
    } catch (e) {
        console.log("[setupGamestate] Failed");
        return e;
    }
}

export async function addGamestate(id: string, data: Gamestate) {
    try {
        const client: WeaviateClient = await weaviate.connectToLocal();
        const collectionName = 'Gamestate_'+id;
        await client.collections.get(collectionName).data.insert(data);
        await client.close();
        console.log("[addGamestate] Added to gamestate");
        return;
    } catch (e) {
        console.log("[addGamestate] Failed");
        return e;
    }
}

export async function listGamestate(id: string) {
    try {
        const client: WeaviateClient = await weaviate.connectToLocal();
        const collectionName = 'Gamestate_'+id;
        const collection = client.collections.get(collectionName);
        for await (let items of collection.iterator()) {
            console.log("[listGamestate] ", items.uuid, items.properties);
        }
        await client.close();
        return;
    } catch (e) {
        console.log("[listGamestate] Failed");
        return e;
    }
}

export async function deleteGamestate(id: string) {
    try {
        const client: WeaviateClient = await weaviate.connectToLocal();
        const collectionName = 'Gamestate_'+id;
        const exist = await client.collections.exists(collectionName);
        if (!exist) {
            console.log("[deleteGamestate] Collection doesn't exist");
            await client.close();
            return;
        }
        await client.collections.delete(collectionName);
        await client.close();
        console.log("[deleteGamestate] Deleted gamestate");
        return;
    } catch (e) {
        console.log("[deleteGamestate] Failed");
        return e;
    }
}

export async function getLoreRAG(query: string, size: number = 5) : Promise<string | unknown> {
    try {
        console.log("[getLoreRAG] Searching in Lore RAG for query : '",query,"' with a result size of ",size);
        const client: WeaviateClient = await weaviate.connectToLocal();
        const results = await client.collections.use('Lore').query.nearText(query, {limit: size});
        let message = "";
        for (let object of results.objects) {
            message += (JSON.stringify(object.properties))+" | ";
        };
        await client.close();
        return message;
    } catch (e) {
        console.log("[getLoreRAG] Failed");
        return e;
    }
}

export async function getGamestateRAG(id :string, query: string, size: number = 5) : Promise<string | unknown> {
    try {
        console.log("[getGamestateRAG] Searching in Gamestate RAG for query : '",query,"' with a result size of ",size);
        const client: WeaviateClient = await weaviate.connectToLocal();
        const collectionName = 'Gamestate_'+id;
        const exist = await client.collections.exists(collectionName);
        if (!exist) {
            console.log("[getGamestateRAG] Collection doesn't exist");
            await client.close();
            return;
        }
        const results = await client.collections.use(collectionName).query.nearText(query, {limit: size});
        let message = "";
        for (let object of results.objects) {
            message += (JSON.stringify(object.properties))+" | ";
        };
        await client.close();
        return message;
    } catch (e) {
        console.log("[getGamestateRAG] Failed");
        return e;
    }
}