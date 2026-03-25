import { type APIRoute } from "astro";
import { listInventory, createItem, updateItem, deleteItem } from "../../../backend/functions/inventory";
import { listQuest, createQuest, updateQuest, deleteQuest } from "../../../backend/functions/quest";
import { getPlayer, updatePlayer } from "../../../backend/functions/player";
import { addGamestate, listGamestate, deleteGamestate, getLoreRAG, getGamestateRAG } from "../../../backend/functions/weaviate";

//get API key and URL
const API_KEY = import.meta.env.LABAI_API_KEY;
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";

//Define what a tool is
interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute: (args: any, id: string) => Promise<any>;
};

//array defining our tools
const tools: Tool[] = [
  //Quest
  {
    name: "listQuest",
    description: "Liste toutes les quêtes de l'utilisateur",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    execute: async (args, id) => listQuest(id),
  },
  {
    name: "createQuest",
    description: "Ajoute une quête à l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Propriétés de la quête",
          properties: {
            name: { type: "string", description: "Nom de la quête" },
            desc: { type: "string", description: "Description de la quête" },
            completed: { type: "boolean", description: "Est-ce que la quête a été complétée" },
          },
        },
      },
      required: ["data"],
    },
    execute: async (args, id) => createQuest(id, args.data),
  },
  {
    name: "updateQuest",
    description: "Modifie une quête déjà existante de l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        questId: { type: "string", description: "ID de la quête à modifier dans la base de donnée" },
        data: {
          type: "object",
          description: "Propriétés de la quête",
          properties: {
            name: { type: "string", description: "Nom de la quête" },
            desc: { type: "string", description: "Description de la quête" },
            completed: { type: "boolean", description: "Est-ce que la quête a été complétée" },
          },
        },
      },
      required: ["questId", "data"],
    },
    execute: async (args, id) => updateQuest(id, args.questId, args.data),
  },
  {
    name: "deleteQuest",
    description: "Supprime une quête existante pour l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        questId: { type: "string", description: "ID de la quête à supprimer dans la base de donnée" },
      },
      required: ["questId"],
    },
    execute: async (args, id) => deleteQuest(id, args.questId),
  },
  //Inventory
  {
    name: "listInventory",
    description: "Liste tous les objets présent dans l'inventaire de l'utilisateur",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    execute: async (args, id) => listInventory(id),
  },
  {
    name: "createItem",
    description: "Ajoute un objet à l'inventaire de l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Propriétés de l'objet",
          properties: {
            name: { type: "string", description: "Nom de l'objet" },
            desc: { type: "string", description: "Description de l'objet" },
            amount: { type: "integer", description: "Quantité d'objets à ajouter à l'inventaire", minimum: 1 },
          },
        },
      },
      required: ["data"],
    },
    execute: async (args, id) => createItem(id, args.data),
  },
  {
    name: "updateItem",
    description: "Modifie un objet déjà présent dans l'inventaire de l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "ID de l'objet à modifier dans la base de donnée" },
        data: {
          type: "object",
          description: "Propriétés de l'objet",
          properties: {
            name: { type: "string", description: "Nom de l'objet" },
            desc: { type: "string", description: "Description de l'objet" },
            amount: { type: "integer", description: "Quantité d'objets à ajouter à l'inventaire", minimum: 1 },
          },
        },
      },
      required: ["itemId", "data"],
    },
    execute: async (args, id) => updateItem(id, args.itemId, args.data),
  },
  {
    name: "deleteItem",
    description: "Supprime un objet présent dans l'inventaire de l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "ID de l'objet à supprimer dans la base de donnée" },
      },
      required: ["itemId"],
    },
    execute: async (args, id) => deleteItem(id, args.itemId),
  },
  //Player
  {
    name: "getPlayer",
    description: "Récupère uniquement le personnage actuel de l'utilisateur",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    execute: async (args, id) => getPlayer(id),
  },
  {
    name: "updatePlayer",
    description: "Modifie un personnage existant de l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        playerId: { type: "string", description: "ID du personnage à modifier" },
        data: {
          type: "object",
          description: "Propriétés du personnage",
          properties: {
            name: { type: "string", description: "Nom du personnage" },
            class: { type: "string", enum: ["chevalier","mage","alchimiste","ombre"], description: "Classe du personnage" },
            maxHP: { type: "integer", description: "Points de vie maximum" },
            currentHP: { type: "integer", description: "Points de vie actuels" },
            for: { type: "integer", description: "Force" },
            def: { type: "integer", description: "Défense" },
            mag: { type: "integer", description: "Magie" },
            agi: { type: "integer", description: "Agilité" },
            isCurrent: { type: "boolean", description: "Si c'est le personnage actuel" },
          },
        },
      },
      required: ["playerId", "data"],
    },
    execute: async (args, id) => updatePlayer(id, args.playerId, args.data),
  },
  //Gamestate and Lore
  {
    name: "addGamestate",
    description: "Ajoute un élément au gamestate de l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Propriétés de l'élément gamestate",
          properties: {
            type: { type: "string", description: "Type de l'élément" },
            name: { type: "string", description: "Nom de l'élément" },
            desc: { type: "string", description: "Description de l'élément" },
          },
        },
      },
      required: ["data"],
    },
    execute: async (args, id) => addGamestate(id, args.data),
  },
  {
    name: "deleteGamestate",
    description: "Supprime un élément au gamestate de l'utilisateur",
    parameters: {
      type: "object",
      properties: {
        gamestateId: {
          type: "string",
          description: "identifiant unique (uuid) de l'élément à supprimer",
        },
      },
      required: ["gamestateId"],
    },
    execute: async (args, id) => deleteGamestate(id, args.gamestateId),
  },
  {
    name: "listGamestate",
    description: "Liste tous les éléments du gamestate de l'utilisateur",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    execute: async (args, id) => listGamestate(id),
  },
  {
    name: "getLoreRAG",
    description: "Recherche dans la base de connaissances lore en utilisant la similarité vectorielle",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "La requête de recherche" },
        size: { type: "integer", description: "Nombre de résultats à retourner", default: 5 },
      },
      required: ["query"],
    },
    execute: async (args, id) => getLoreRAG(args.query, args.size || 5),
  },
  {
    name: "getGamestateRAG",
    description: "Recherche dans le gamestate de l'utilisateur en utilisant la similarité vectorielle",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "La requête de recherche" },
        size: { type: "integer", description: "Nombre de résultats à retourner", default: 5 },
      },
      required: ["query"],
    },
    execute: async (args, id) => getGamestateRAG(id, args.query, args.size || 5),
  },
];

const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

//array generated for the LLM stating the tool it has access to
const toolsArray = tools.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  },
}));

//we can define the max amount of call the LLM can make before we force it to stop calling tools
const maxToolCallAmount : number = 10;

//new parser used to parse content when the LLM is too dumb to use its integrated tool_call response
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
};

//we keep the system prompt out of the POST for readability
const systemPrompt: string = "Tu es un assistant IA, répond aux requêtes de l'utilisateur de la manière la plus simple et directe possible."+
"Tu peux utiliser des tool call pour aider l'utilisateur à gérer ses collections inventory, player, quest et gamestate dans une base de données."+
"Tu ne connais pas les id, utilise les fonctions de liste pour les trouver avant d'agir.";

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
                        
                        const tool = toolMap.get(name);
                        if (tool) {
                            toolResult = await tool.execute(args, id);
                        } else {
                            toolResult = { error: `Unknown tool: ${name}`}
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