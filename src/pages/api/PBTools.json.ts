import type { APIRoute } from "astro";
import { listInventory, getItem, createItem, updateItem, deleteItem } from "../../../backend/backend";

//get API key and URL
const API_KEY = import.meta.env.LABAI_API_KEY;
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";

// Helper: parse multiple OpenWebUI tool calls from a single response
// function parseAllToolCalls(content: string): Array<{ name: string; args: any }> {
//   const TAG = "[TOOL_CALLS]";
//   const toolCalls: Array<{ name: string; args: any }> = [];
  
//   let searchIndex = 0;
//   while (true) {
//     const tagIndex = content.indexOf(TAG, searchIndex);
//     if (tagIndex === -1) break;

//     const afterTag = content.slice(tagIndex + TAG.length);
//     const nameMatch = afterTag.match(/^([a-zA-Z0-9_]+)/);
//     if (!nameMatch) {
//       searchIndex = tagIndex + TAG.length;
//       continue;
//     }

//     const name = nameMatch[1];
//     const argsStart = tagIndex + TAG.length + name.length;
//     const argsJson = content.slice(argsStart);

//     // Find the matching closing brace for the JSON object
//     let braceCount = 0;
//     let argsEnd = -1;
//     for (let i = 0; i < argsJson.length; i++) {
//       if (argsJson[i] === "{") braceCount++;
//       if (argsJson[i] === "}") braceCount--;
//       if (braceCount === 0 && argsJson[i] === "}") {
//         argsEnd = i + 1;
//         break;
//       }
//     }

//     if (argsEnd === -1) {
//       searchIndex = tagIndex + TAG.length;
//       continue;
//     }

//     const argsStr = argsJson.slice(0, argsEnd);
//     try {
//       const args = JSON.parse(argsStr);
//       toolCalls.push({ name, args });
//     } catch (e) {
//       console.log("[PBTools] Failed to parse args: " + argsStr);
//     }

//     searchIndex = argsStart + argsEnd;
//   }

//   return toolCalls;
// }

// export const POST: APIRoute = async ({ request }) => {
//   const { messages } = await request.json() as { 
//     messages: Array<{ role: string; content: string }>
//   };

//   if (!messages || !Array.isArray(messages) || messages.length === 0) {
//     return new Response(
//       JSON.stringify({ error: "Body must include a non-empty 'messages' array" }),
//       { status: 400, headers: { "Content-Type": "application/json" } },
//     );
//   }

//   const systemPrompt =
//     "You can use tools to interact with the inventory database. Help the user manage items by listing, getting, creating, updating or deleting inventory items.";

//   const toolsArray = [
//     {
//       type: "function",
//       function: {
//         name: "listInventory",
//         description: "Get all items from the inventory",
//         parameters: {
//           type: "object",
//           properties: {},
//           required: [],
//         },
//       },
//     },
//     {
//       type: "function",
//       function: {
//         name: "getItem",
//         description: "Get a specific item by ID",
//         parameters: {
//           type: "object",
//           properties: {
//             itemId: {
//               type: "string",
//               description: "The ID of the item to retrieve",
//             },
//           },
//           required: ["itemId"],
//         },
//       },
//     },
//     {
//       type: "function",
//       function: {
//         name: "createItem",
//         description: "Create a new inventory item",
//         parameters: {
//           type: "object",
//           properties: {
//             name: {
//               type: "string",
//               description: "Item name",
//             },
//             desc: {
//               type: "string",
//               description: "Item description",
//             },
//             amount: {
//               type: "number",
//               description: "Item quantity",
//             },
//           },
//           required: ["name", "desc", "amount"],
//         },
//       },
//     },
//     {
//       type: "function",
//       function: {
//         name: "updateItem",
//         description: "Update an existing inventory item",
//         parameters: {
//           type: "object",
//           properties: {
//             itemId: {
//               type: "string",
//               description: "The ID of the item to update",
//             },
//             name: {
//               type: "string",
//               description: "New item name",
//             },
//             desc: {
//               type: "string",
//               description: "New item description",
//             },
//             amount: {
//               type: "number",
//               description: "New item quantity",
//             },
//           },
//           required: ["itemId", "name", "desc", "amount"],
//         },
//       },
//     },
//     {
//       type: "function",
//       function: {
//         name: "deleteItem",
//         description: "Delete an inventory item",
//         parameters: {
//           type: "object",
//           properties: {
//             itemId: {
//               type: "string",
//               description: "The ID of the item to delete",
//             },
//           },
//           required: ["itemId"],
//         },
//       },
//     },
//   ];

//   let chatMessages: Array<{ role: string; content: string }> = [
//     { role: "system", content: systemPrompt },
//     ...messages,
//   ];

//   // Tool call loop
//   for (let i = 0; i < 5; i++) {
//     const res = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
//         messages: chatMessages,
//         tools: toolsArray,
//         tool_choice: "auto",
//       }),
//     });

//     const data = await res.json();
//     const choice = data[0] ?? data.choices?.[0];
//     const content = choice?.message?.content as string | undefined;

//     console.log("[PBTools] Response: " + content);

//     // Check for tool calls
//     const toolCalls = parseAllToolCalls(content ?? "");

//     if (toolCalls.length === 0) {
//       // No tool calls - return final response
//       return new Response(
//         JSON.stringify({ reply: content }),
//         { status: 200, headers: { "Content-Type": "application/json" } },
//       );
//     }

//     // Execute all tools in this response
//     for (const toolCall of toolCalls) {
//       let toolResult: any = null;
//       try {
//         if (toolCall.name === "listInventory") {
//           toolResult = await listInventory();
//         } else if (toolCall.name === "getItem") {
//           toolResult = await getItem(toolCall.args.itemId);
//         } else if (toolCall.name === "createItem") {
//           toolResult = await createItem(toolCall.args.name, toolCall.args.desc, toolCall.args.amount);
//         } else if (toolCall.name === "updateItem") {
//           toolResult = await updateItem(toolCall.args.itemId, toolCall.args.name, toolCall.args.desc, toolCall.args.amount);
//         } else if (toolCall.name === "deleteItem") {
//           await deleteItem(toolCall.args.itemId);
//           toolResult = { success: true };
//         }
//       } catch (err) {
//         toolResult = { error: String(err) };
//       }

//       // Add tool result to messages and continue loop
//       chatMessages.push({ role: "user", content: `Tool result: ${JSON.stringify(toolResult)}` });
//     }
//   }

//   return new Response(
//     JSON.stringify({ reply: "Max tool calls reached" }),
//     { status: 200, headers: { "Content-Type": "application/json" } },
//   );
// };

//parse the [TOOL_CALLS] request, should be able to handle multiple call in a single request
function parseToolCalls(request : string): { name: string; args: any } | null {
    const TAG = "[TOOL_CALLS]";
    if (!request.includes(TAG)) {
        return null;
    }
    
}