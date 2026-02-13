/**
 * Test script to verify the Tzafon model integration with @inngest/ai.
 *
 * Usage:
 *   TZAFON_API_KEY=sk_... npx tsx src/test-tzafon-model.ts
 *
 * Or with a .env file containing TZAFON_API_KEY:
 *   npx tsx src/test-tzafon-model.ts
 */

import dotenv from "dotenv";
dotenv.config();

// Import tzafon from our local build of @inngest/ai
import { tzafon } from "../../inngest-js/packages/ai/dist/index.js";

async function main() {
  const apiKey = process.env.TZAFON_API_KEY;
  if (!apiKey) {
    console.error("Error: TZAFON_API_KEY environment variable is required");
    process.exit(1);
  }

  // 1. Verify the model creator produces a valid adapter
  const model = tzafon({ model: "tzafon.sm-1" });

  console.log("=== Tzafon Model Adapter ===");
  console.log("url:     ", model.url);
  console.log("format:  ", model.format);
  console.log("authKey: ", model.authKey ? `${model.authKey.slice(0, 6)}...` : "(missing)");
  console.log();

  // 2. Make a real chat completion request
  console.log("=== Chat Completion Test ===");
  const body: Record<string, unknown> = {
    messages: [
      { role: "system", content: "You are a helpful assistant. Reply in one sentence." },
      { role: "user", content: "What is Tzafon?" },
    ],
    max_tokens: 100,
  };

  // Let onCall set model and default params
  model.onCall?.(undefined as any, body);

  console.log("Request:");
  console.log("  model:", body.model);
  console.log("  messages:", JSON.stringify(body.messages));
  console.log();

  const response = await fetch(model.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${model.authKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error ${response.status}:`, errorText);
    process.exit(1);
  }

  const result = await response.json();

  console.log("Response:");
  console.log("  model:  ", result.model);
  console.log("  content:", result.choices?.[0]?.message?.content);
  console.log("  usage:  ", JSON.stringify(result.usage));
  console.log("  finish: ", result.choices?.[0]?.finish_reason);
  console.log();

  // 3. Test with tools param to see if Tzafon errors or ignores it
  console.log("=== Tools Parameter Test ===");
  const toolsBody: Record<string, unknown> = {
    model: "tzafon.sm-1",
    messages: [{ role: "user", content: "Hello" }],
    max_tokens: 50,
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Get the weather",
          parameters: { type: "object", properties: { city: { type: "string" } } },
        },
      },
    ],
  };

  const toolsResponse = await fetch(model.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${model.authKey}`,
    },
    body: JSON.stringify(toolsBody),
  });

  if (toolsResponse.ok) {
    const toolsResult = await toolsResponse.json();
    console.log("Result:  Tzafon IGNORES tools param (no error)");
    console.log("  content:", toolsResult.choices?.[0]?.message?.content);
  } else {
    const errorText = await toolsResponse.text();
    console.log(`Result:  Tzafon REJECTS tools param (HTTP ${toolsResponse.status})`);
    console.log("  error:", errorText);
    console.log();
    console.log("=> A custom adapter will be needed to strip tools from requests.");
  }

  console.log();
  console.log("=== Done ===");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
