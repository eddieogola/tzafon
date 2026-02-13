/**
 * Test script to verify the Tzafon agent-kit integration end-to-end.
 *
 * Tests both @inngest/ai (model creator) and @inngest/agent-kit (adapter,
 * agent creation, request parsing, and live inference).
 *
 * Usage:
 *   pnpm test:agentkit
 *
 * Or with a .env file containing TZAFON_API_KEY:
 *   npx tsx src/test-tzafon-agentkit.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { tzafon } from "../../inngest-js/packages/ai/dist/index.js";
import { createRequire } from "node:module";
import { z } from "zod";

const require = createRequire(import.meta.url);
const {
  createAgenticModelFromAiAdapter,
  createAgent,
  createNetwork,
} = require("../../agent-kit/packages/agent-kit/dist/index.cjs");

async function main() {
  const apiKey = process.env.TZAFON_API_KEY;
  if (!apiKey) {
    console.error("Error: TZAFON_API_KEY environment variable is required");
    process.exit(1);
  }

  // 1. Create the model adapter
  const model = tzafon({ model: "tzafon.sm-1", apiKey });

  console.log("=== Tzafon Model Adapter ===");
  console.log("  url:    ", model.url);
  console.log("  format: ", model.format);
  console.log("  authKey:", model.authKey ? `${model.authKey.slice(0, 6)}...` : "(missing)");
  console.log();

  // 2. Create an agentic model (wires up the adapter's request/response parsers)
  const agenticModel = createAgenticModelFromAiAdapter(model);

  console.log("=== Agentic Model ===");
  console.log("  requestParser: ", typeof agenticModel.requestParser);
  console.log("  responseParser:", typeof agenticModel.responseParser);
  console.log();

  // 3. Test the adapter strips tools from the request
  console.log("=== Adapter: Tools Stripping ===");

  const messages = [{ type: "text", role: "user", content: "What is 2 + 2?" }];
  const tools = [
    {
      name: "calculator",
      description: "Perform arithmetic",
      parameters: z.object({ expression: z.string() }),
      handler: async () => "4",
    },
  ];

  const request = agenticModel.requestParser(model, messages, tools, "auto");

  console.log("  messages:", JSON.stringify(request.messages));
  console.log("  tools:   ", request.tools ?? "(stripped)");
  console.log("  tool_choice:", request.tool_choice ?? "(stripped)");
  console.log();

  // 4. Send the adapter-processed request to the live Tzafon API
  console.log("=== Live API Call (via adapter) ===");

  request.model = "tzafon.sm-1";
  request.max_tokens = 100;

  const response = await fetch(model.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${model.authKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error ${response.status}:`, errorText);
    process.exit(1);
  }

  const raw = await response.json();

  console.log("  model:  ", raw.model);
  console.log("  content:", raw.choices?.[0]?.message?.content);
  console.log("  usage:  ", JSON.stringify(raw.usage));
  console.log("  finish: ", raw.choices?.[0]?.finish_reason);
  console.log();

  // 5. Parse the response through the adapter
  console.log("=== Response Parser ===");

  const parsed = agenticModel.responseParser(raw);

  console.log("  messages:", parsed.length);
  console.log("  type:   ", parsed[0]?.type);
  console.log("  role:   ", parsed[0]?.role);
  console.log(
    "  content:",
    typeof parsed[0]?.content === "string"
      ? parsed[0].content
      : JSON.stringify(parsed[0]?.content)
  );
  console.log();

  // 6. Verify agent and network creation works
  console.log("=== Agent & Network Creation ===");

  const agent = createAgent({
    name: "math_helper",
    system: "You are a helpful math assistant. Reply concisely.",
    model: tzafon({ model: "tzafon.sm-1", apiKey }),
  });
  console.log("  agent:  ", agent.name);

  const network = createNetwork({
    name: "math_network",
    agents: [agent],
    defaultModel: tzafon({
      model: "tzafon.sm-1",
      apiKey,
      defaultParameters: { temperature: 0.3, max_tokens: 200 },
    }),
  });
  console.log("  network:", network.name);
  console.log("  agents:  [math_helper]");
  console.log();

  console.log("=== Done ===");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
