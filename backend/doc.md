# Elyndra backend documentation

This is a personal doc to help this project's dev build decent code.

It contains information about:

- [Project architecture](#project-architecture)
- [Syntax, case and good practice](#syntax-case-and-good-practice)
- [Astro's API endpoints](#astros-api-endpoints)
- [LabAI LLM](#labai-llm)
- [Weaviate and RAG](#weaviate-and-rag)
- [Pocketbase and gamestate](#pocketbase-and-gamestate)
- [Using Tools](#using-tools)
- [Important code snippets](#important-code-snippets)

## Project architecture

Tech stack :

- Astro
- LabAI
- Weaviate
- Pocketbase

Interactions with the backend are mostly handled through **Astro's API Endpoints**.

Every user has a **unique ID** that is used for account information and gamestate information. A user cannot have multiple games running simultaneously.

The **weaviate DB** holds the Lore collection, a collection of general information about the world and its rules that the LLM consults for information but never alter.

It also holds the gamestate collection of each user, identified by the user's ID.

The **Pocketbase DB** holds highly transactional informations like inventory and entity stats. Each user having their respective collections identified by their ID.

## Syntax, case and good practice

### Logs

Every log must specify which function it comes from between brackets at its start.

```TS
function logFunction() {
    console.log("[logFunction] Log whatever you want here")
}
```

### Functions

Functions should do simple tasks, overly complex ones should be break down into multiple smaller ones.

Functions' names start with a verb and describe simply what the function does, they are written in camelCase.

```TS
function getExample() {
    ...
}

function deleteAllExample() {
    ...
}

function sortExampleByName() [
    ...
]
```

Function argument respect the variables and const case as seen below.

### Variables and const

Variables and consts should also be named in camelCase. Their names should describe what the value is and adapt depending on the expected type.

```TS
//booleans use prefixes like is and has to form a question answered by the value
let isAlive : boolean

//collections use plural nouns describing the elements in them
let toolCalls : string[]

//numbers should use meaningful units in their name
let tokenCount : number
```

Global const like API keys or database URLs are named in UPPER_SNAKE_CASE instead.

```TS
const GLOBAL_CONST
```

## Astro's API Endpoints

Astro API endpoints are server-side routes that handle HTTP requests. They're defined in `src/pages/api/` where each file becomes a route.

### File Structure

```TS
// src/pages/api/example.json.ts
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  // Process request
  return new Response(JSON.stringify({ result: "..." }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
```

### Supported Methods

Export named functions for each HTTP method: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.

### Request Handling

- Get the request body: `await request.json()`
- Validate inputs before processing
- Return a `Response` object with status and headers

### Response Format

Always return JSON responses:

```TS
return new Response(JSON.stringify(data), {
  status: 200,
  headers: { "Content-Type": "application/json" }
});
```

### Error Handling

Use try-catch blocks and return appropriate status codes (400 for bad input, 500 for server errors).

### Route Naming

- File `example.json.ts` → `/api/example.json`
- Use `.json` extension for JSON API routes

### Elyndra's specific API Endpoints

TODO

## LabAI LLM

LabAI is a UMLP-hosted LLM using Mistral models via Open WebUI. Accessed through API at `https://lab-ia.umlp.fr/api/chat/completions`.

### Available Models

- `mistralai/Mistral-Small-3.2-24B-Instruct-2506`
- `openai/gpt-oss-120b`

### Basic API Call

```TS
const API_KEY = import.meta.env.LABAI_API_KEY;
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";

const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
    messages: [
      { role: "system", content: "System prompt" },
      { role: "user", content: "User message" }
    ],
  }),
});

const data = await response.json();
const reply = data.choices?.[0]?.message?.content;
```

**Important**: Must be connected to UFC VPN to use the API.

## Weaviate and RAG

Weaviate is a vectorial database that holds lore and non transactional gamestate. We use it for RAG to give the LLM relevant context.

### Connect to local DB

```TS
import weaviate, { type WeaviateClient } from 'weaviate-client';

const DBclient: WeaviateClient = await weaviate.connectToLocal();
```

### Query with RAG

Steps:

1. Rewrite user query into search query using LLM
2. Search Weaviate with the transformed query
3. Add search results to system message
4. Send full context to LLM for response

```TS
//use a collection like "Lore"
const lore = DBclient.collections.use("Lore");

//search with a query string
const result = await lore.query.nearText(JSON.stringify(query), {limit: 5});

//build context from results
let contextMessage = "Context info: ";
for (let object of result.objects) {
  contextMessage += JSON.stringify(object.properties) + " | ";
}

//add to messages before sending to LLM
messages = [{role: "system", content: contextMessage}, ...messages];
```

## Pocketbase and gamestate

Pocketbase is a self-hosted database for user accounts and transactional data like inventory and entity stats. We will use Google OAuth for authentication.

### Connect to Pocketbase

```TS
import PocketBase from 'pocketbase';

const PB_URL = "http://127.0.0.1:8090"; // local instance
const pb = new PocketBase(PB_URL);
```

### Google OAuth authentication

User login with Google:

```TS
//redirect to Google login
const authData = await pb.collection('users').authWithOAuth2({
  provider: 'google',
  urlCallback: (url) => {
    window.location.href = url; // or handle redirect
  },
});

//now pb.authStore has user info and auth token
console.log(pb.authStore.model.id); // user ID
```

Store auth token for later requests:

```TS
//after successful login, token is auto-stored
//for API calls, include it in headers if needed
const token = pb.authStore.token;
```

Check if user is authenticated:

```TS
if (pb.authStore.isValid) {
  // user is logged in
  const userId = pb.authStore.model.id;
}
```

### Interact with collections

Get a collection:

```TS
const inventory = pb.collection('inventory');
```

Create record:

```TS
const newItem = await inventory.create({
  user_id: userId,
  item_name: "Sword",
  quantity: 1,
});
```

Get record by ID:

```TS
const item = await inventory.getOne(recordId);
```

Get records with filter:

```TS
//get all items for a user
const userItems = await inventory.getList(1, 50, {
  filter: `user_id = "${userId}"`,
});

console.log(userItems.items); // array of records
```

Update record:

```TS
const updated = await inventory.update(recordId, {
  quantity: 5,
});
```

Delete record:

```TS
await inventory.delete(recordId);
```

## Using Tools

Tools let the LLM call functions. It decides when and if to use them based on the user's message.

### Defining Tools

```TS
{
  type: "function",
  function: {
    name: "increment_counter",
    description: "Increment the counter by a specified amount",
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Amount to increment"
        }
      },
      required: []
    }
  }
}
```

### Parsing Tool Calls

LLM uses OpenWebUI format: `[TOOL_CALLS]function_name{"param": value}`

```TS
function parseToolCall(content: string) {
  const TAG = "[TOOL_CALLS]";
  if (!content.startsWith(TAG)) return null;

  const withoutTag = content.slice(TAG.length);
  const nameMatch = withoutTag.match(/^([a-zA-Z0-9_]+)/);
  const name = nameMatch?.[1];
  const argsJson = withoutTag.slice(name?.length ?? 0);
  const args = argsJson ? JSON.parse(argsJson) : {};

  return { name, args };
}
```

### Use Cases

- Database queries
- State updates
- Calculations
- External API calls

## Important code snippets

### Parsing function for tool calls

```TS
//parse the [TOOL_CALLS] request, should be able to handle multiple call in a single request
function parseToolCalls(request : string): Array<{ name: string; args: any }> | null {
    console.log("[parseToolCalls] Parsing request looking for tool call")
    const TAG : string = "[TOOL_CALLS]";
    const toolCalls : Array<{ name: string; args: any }> = [];

    if (!request.includes(TAG)) {
        console.log("[parseToolCalls] No tool call found in request")
        return null;
    }

    //split the request into different sections delimited by the TAG, filter removes empty values
    const splittedRequests : Array<string> = request.split(TAG).filter(d => d);
    console.log("[parseToolCalls] Found",splittedRequests.length,"tool call in request")

    //for each call, get the name of the function called and the arguments
    splittedRequests.forEach(call => {
        const nameMatch = call.match(/^([a-zA-Z0-9_]+)/);
        if (!nameMatch) return null;
        const name = nameMatch[1];

        const argsJSON = call.slice(name.length);
        const args = checkValidJSON(argsJSON) ? JSON.parse(argsJSON) : {};

        toolCalls.push({ name, args });
        console.log("[parseToolCalls] Added a call for",name,"to the list of toolCalls")
    });

    return toolCalls;
}
```

### Helper checking if a string can be parsed in json
```TS
function checkValidJSON(string : string) {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}
```

