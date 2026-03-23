import { type APIRoute } from "astro";
import { addGamestate, deleteGamestate, getGamestateRAG, getLoreRAG, listCollections, listGamestate } from "../../../../backend/functions/proto/weaviate";
import { createItem } from "../../../../backend/functions/proto/inventory";

const toolsArray = [
    {
        type: "function",
        function: {
            name: "listInventory",
            description: "Liste tous les objets présent dans l'inventaire de l'utilisateur",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "createItem",
            description: "Ajoute un objet à l'inventaire de l'utilisateur",
            parameters: {
                type: "object",
                properties: {
                    data: {
                        type: "object",
                        description: "Propriétés de l'objet",
                        properties: {
                            name: {
                                type: "string",
                                description: "Nom de l'objet"
                            },
                            desc: {
                                type: "string",
                                description: "Description de l'objet"
                            },
                            amount: {
                                type: "integer",
                                description: "Quantité d'objets à ajouter à l'inventaire",
                                minimum: 1,
                            },
                        }
                    }
                },
                required: ["data"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "updateItem",
            description: "Modifie un objet déjà présent dans l'inventaire de l'utilisateur",
            parameters: {
                type: "object",
                properties: {
                    itemId: {
                        type: "string",
                        description: "ID de l'objet à modifier dans la base de donnée"
                    },
                    data: {
                        type: "object",
                        description: "Propriétés de l'objet",
                        properties: {
                            name: {
                                type: "string",
                                description: "Nom de l'objet"
                            },
                            desc: {
                                type: "string",
                                description: "Description de l'objet"
                            },
                            amount: {
                                type: "integer",
                                description: "Quantité d'objets à ajouter à l'inventaire",
                                minimum: 1,
                            },
                        }
                    }
                },
                required: ["itemId", "data"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "deleteItem",
            description: "Supprime un objet présent dans l'inventaire de l'utilisateur",
            parameters: {
                type: "object",
                properties: {
                    itemId: {
                        type: "string",
                        description: "ID de l'objet à modifier dans la base de donnée"
                    },
                },
                required: ["itemId"],
            },
        },
    },
]

function parseToolCalls(content: string): Array<{ function: { name: string; arguments: string } }> | null {
    const toolNames = toolsArray.map(t => t.function.name);
    const results: Array<{ function: { name: string; arguments: string } }> = [];
    let i = 0;
    while (i < content.length) {
        let found = false;
        for (const name of toolNames) {
            if (content.startsWith(name, i)) {
                i += name.length;
                // now parse JSON from i
                let braceCount = 0;
                let start = i;
                let inString = false;
                let escaped = false;
                while (i < content.length) {
                    const char = content[i];
                    if (inString) {
                        if (escaped) {
                            escaped = false;
                        } else if (char === '\\') {
                            escaped = true;
                        } else if (char === '"') {
                            inString = false;
                        }
                    } else {
                        if (char === '"') {
                            inString = true;
                        } else if (char === '{') {
                            braceCount++;
                        } else if (char === '}') {
                            braceCount--;
                            if (braceCount === 0) {
                                i++;
                                break;
                            }
                        }
                    }
                    i++;
                }
                if (braceCount === 0) {
                    const jsonStr = content.substring(start, i);
                    try {
                        JSON.parse(jsonStr); // validate
                        results.push({ function: { name, arguments: jsonStr } });
                        found = true;
                    } catch (e) {
                        // invalid JSON, skip
                    }
                }
                break;
            }
        }
        if (!found) {
            i++; // move to next char if no tool found
        }
    }
    return results.length > 0 ? results : null;
}

export const POST: APIRoute = async ({locals, request}) => {
    try {
        console.log("[testFunction] Testing some function");
        const parsed = parseToolCalls("J'ai aouté 100 crousti à ton inventaire");
        console.log("[testFunction] parsed :",parsed);
        return new Response(
            JSON.stringify({ reply: "Test function correctly" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ reply: "There was an error :", error }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};