import { type APIRoute } from "astro";
import { listInventory, createItem, updateItem, deleteItem } from "../../../../backend/functions/proto/inventory"; 
import { listCollections, addGamestate } from "../../../../backend/functions/proto/weaviate";
import { object } from "astro:schema";

//get API key and URL
const API_KEY = import.meta.env.LABAI_API_KEY;
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";

//we keep the system prompt out of the POST for readability
const systemPrompt: string = "Tu es un assistant IA, répond aux requêtes de l'utilisateur de la manière la plus simple et directe possible."+
"Tu peux utiliser des tool call pour aider l'utilisateur à gérer ses collections inventory, entity, player et gamestate dans une base de données."+
"Ne fais pas plusieurs tool call dans la même requête, fais les un par un."+
"Quand tu ne connais pas l'id d'une entrée sur laquelle tu veux agir, liste d'abords la collection pour trouver le bon id";

//array of tools the LLM as access to
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

//we can define the max amount of call the LLM can make before we force it to stop calling tools
const maxToolCallAmount : number = 5;

// //parse the [TOOL_CALLS] request, should be able to handle multiple call in a single request
// function parseToolCalls(request : string): Array<{ name: string; args: any }> | null {
//     console.log("[parseToolCalls] Parsing request looking for tool call")
//     const TAG : string = "[TOOL_CALLS]";
//     const toolCalls : Array<{ name: string; args: any }> = [];
    
//     if (!request.includes(TAG)) {
//         console.log("[parseToolCalls] No tool call found in request")
//         return null;
//     }

//     //split the request into different sections delimited by the TAG, filter removes empty values
//     const splittedRequests : Array<string> = request.split(TAG).filter(d => d);
//     console.log("[parseToolCalls] Found",splittedRequests.length,"tool call in request")

//     //for each call, get the name of the function called and the arguments
//     splittedRequests.forEach(call => {
//         const nameMatch = call.match(/^([a-zA-Z0-9_]+)/);
//         if (!nameMatch) return null;
//         const name = nameMatch[1];

//         const argsJSON = call.slice(name.length);
//         const args = checkValidJSON(argsJSON) ? JSON.parse(argsJSON) : {};

//         toolCalls.push({ name, args });
//         console.log("[parseToolCalls] Added a call for",name,"to the list of toolCalls")
//     });

//     return toolCalls;
// }

// //simple helper function that check if a string is valid JSON format
// function checkValidJSON(string : string) {
//     try {
//         JSON.parse(string);
//     } catch (e) {
//         return false;
//     }
//     return true;
// }

//new parser used to parse content of the request when the LLM is too dumb to use its integrated tool_call response
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
        console.log("[chat] Chatting ...");
        const id = locals.pb.authStore.record?.id;
        //if the user is connected
        if (id) {
            //getting the messages
            const {messages} = await request.json() as {
                messages: Array<{ role: string, content: string}>
            };

            //basic check
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                console.log("[chat] Messages failed basic check");
                return new Response(
                    JSON.stringify({ error: "Body must include a non-empty 'messages' array" }),
                    { status: 400, headers: { "Content-Type": "application/json" } },
                );
            };
            console.log("[chat] Messages passed basic check");

            let chatMessages: Array<{ role: string; content: string }> = [
                { role: "system", content: systemPrompt },
                ...messages,
            ];

            for (let i = 0; i < maxToolCallAmount; i++) {
                console.log("[chat] Handling request",i);
                //request to LLM API
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
                        messages: chatMessages,
                        tools: toolsArray,
                        tool_choice: "auto",
                    }),
                });

                //getting response content
                const data = await res.json();
                const choice = data[0] ?? data.choices?.[0];

                console.log("[chat] Message of response",i,":", JSON.stringify(choice.message, null, 2));

                //checking for tool call
                console.log("[chat] Checking for tool call in response",i);
                let toolCalls;
                if (choice.message.tool_calls) {
                    toolCalls = choice.message.tool_calls;
                } else {
                    toolCalls = parseToolCalls(choice.message.content);
                }
                console.log("[chat] Tool call of response",i,":",toolCalls);

                if (!toolCalls || toolCalls.length === 0 ) {
                    //if there are no tool call, we return the response
                    console.log("[chat] No tool call found, returning response",i);
                    return new Response(
                        JSON.stringify({ reply: choice.message.content }),
                        { status: 200, headers: { "Content-Type": "application/json" } },
                    );
                };

                // Execute all tools in this response
                for (const toolCall of toolCalls) {
                    let toolResult: any = null;
                    try {
                        const name = toolCall.function.name;
                        const args = JSON.parse(toolCall.function.arguments);
                        if (name === "listInventory") {
                            toolResult = await listInventory(id);
                        } else if (name === "createItem") {
                            toolResult = await createItem(id, args.data);
                        } else if (name === "updateItem") {
                            toolResult = await updateItem(id, args.itemId, args.data);
                        } else if (name === "deleteItem") {
                            toolResult = await deleteItem(id, args.itemId);
                        }
                    } catch (e) {
                        toolResult = { error: String(e) };
                    };
        
                    // Add tool result to messages and continue loop
                    console.log("[chat] Tool result :",toolResult)
                    chatMessages.push({ role: "user", content: `Tool result: ${JSON.stringify(toolResult)}` });
                };
            }
            //response if max tool call was reached
            return new Response(
                JSON.stringify({ reply: "Max tool calls reached" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        //if the user isn't connected
        } else {
            //Response if not connected
            return new Response(
                JSON.stringify({ reply: "You must be connected to chat" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }
    } catch (error) {
        //Response if things went wrong
        return new Response(
            JSON.stringify({ reply: "There was an error :", error }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};