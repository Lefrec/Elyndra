import type { APIRoute } from "astro";

//get API key and URL
const API_KEY = import.meta.env.LABAI_API_KEY;
const API_URL = "https://lab-ia.umlp.fr/api/chat/completions";

// Counter
let counter = 0;

// Tools 
function incrementCounter(amount: number = 1) {
  counter += amount;
  return counter;
}

function getCounter() {
  return counter;
}

// Helper: parse OpenWebUI `[TOOL_CALLS]increment_counter{"amount": 6}`
function parseToolCall(content: string):
  | { name: string; args: any }
  | null {
  const TAG = "[TOOL_CALLS]";
  if (!content.startsWith(TAG)) return null;

  const withoutTag = content.slice(TAG.length); // "increment_counter{\"amount\": 6}"
  const nameMatch = withoutTag.match(/^([a-zA-Z0-9_]+)/);
  if (!nameMatch) return null;

  const name = nameMatch[1];
  const argsJson = withoutTag.slice(name.length); // "{\"amount\": 6}"
  const args = argsJson ? JSON.parse(argsJson) : {};
  return { name, args };
}

export const POST: APIRoute = async ({ request }) => {
  const { message } = await request.json() as { message: string };

  const systemPrompt =
    "You can use tools to read or increment a shared server counter when the user asks.";

  //First call
  const firstRes = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "increment_counter",
            description: "Increment the counter",
            parameters: {
              type: "object",
              properties: {
                amount: {
                  type: "number",
                  description: "How much to increment the counter by",
                },
              },
              required: [],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_counter",
            description: "Get the current value of the counter",
            parameters: { type: "object", properties: {} },
          },
        },
      ],
      tool_choice: "auto",
    }),
  });

  const firstData = await firstRes.json();

  const firstChoice = firstData[0] ?? firstData.choices?.[0];
  const assistantMsg = firstChoice?.message;
  const content = assistantMsg?.content as string | undefined;

  console.log(content);

  //Check if tool call
  const parsed = parseToolCall(content ?? "");

  //If no tool call
  if (!parsed) {
    return new Response(
      JSON.stringify({ reply: content }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  //If tool call
  let toolResult: any = null;

  if (parsed.name === "increment_counter") {
    const newValue = incrementCounter(parsed.args.amount ?? 1);
    toolResult = { counter: newValue };
  } else if (parsed.name === "get_counter") {
    toolResult = { counter: getCounter() };
  } else {
    // Unknown tool -> you can choose to ignore or return an error
    toolResult = { error: `Unknown tool: ${parsed.name}` };
  }

  //Second call
  const finalRes = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
        { role: "system", content: `Tool "${parsed.name}" called with ${JSON.stringify(parsed.args,)} and returned ${JSON.stringify(toolResult)}.`},
      ]
    }),
  });

  const finalData = await finalRes.json();
  const finalChoice = finalData[0] ?? finalData.choices?.[0];
  const finalReply = finalChoice?.message?.content ?? "";

  return new Response(
    JSON.stringify({ reply: finalReply, counter, toolResult }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
