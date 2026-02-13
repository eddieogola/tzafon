/**
 * Test script to verify the full Tzafon integration across both packages:
 *   1. @inngest/ai       — model creator (format, url, auth)
 *   2. @inngest/agent-kit — adapter (tools stripping) + response parsing
 *
 * Imports from local builds since the upstream PRs haven't been merged yet.
 *
 * Usage:
 *   pnpm test:integration
 *
 * Requires TZAFON_API_KEY in .env or environment.
 */

import dotenv from "dotenv";
dotenv.config();

// Import tzafon model creator from our local @inngest/ai build
import { tzafon } from "../../inngest-js/packages/ai/dist/index.js";

// Import the Tzafon adapter from our local agent-kit build (CJS bundle
// which has all adapters inlined, avoiding the @inngest/ai version mismatch)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const agentKitCjs = require("../../agent-kit/packages/agent-kit/dist/index.cjs");
const { createAgenticModelFromAiAdapter } = agentKitCjs;

// Zod for tool parameter schemas (agent-kit expects Zod schemas)
import { z } from "zod";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  const apiKey = process.env.TZAFON_API_KEY;
  if (!apiKey) {
    console.error("Error: TZAFON_API_KEY environment variable is required");
    process.exit(1);
  }

  // ───────────────────────────────────────────
  // Test 1: @inngest/ai — Model creator
  // ───────────────────────────────────────────
  console.log("\n=== 1. @inngest/ai — Model Creator ===\n");

  const model = tzafon({ model: "tzafon.sm-1", apiKey });

  assert("format is 'tzafon'", model.format === "tzafon", `got '${model.format}'`);
  assert(
    "url is correct",
    model.url === "https://api.tzafon.ai/v1/chat/completions",
    `got '${model.url}'`
  );
  assert("authKey is set", model.authKey.length > 0);

  const body: Record<string, unknown> = {};
  model.onCall?.(undefined as any, body);
  assert("onCall sets model", body.model === "tzafon.sm-1", `got '${body.model}'`);

  // ───────────────────────────────────────────
  // Test 2: @inngest/ai — Direct API call (no tools)
  // ───────────────────────────────────────────
  console.log("\n=== 2. @inngest/ai — Direct API Call ===\n");

  const chatBody = {
    model: "tzafon.sm-1",
    messages: [
      { role: "system", content: "Reply in exactly one sentence." },
      { role: "user", content: "What is 2 + 2?" },
    ],
    max_tokens: 50,
  };

  const chatResponse = await fetch(model.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${model.authKey}`,
    },
    body: JSON.stringify(chatBody),
  });

  assert("chat completion returns 200", chatResponse.ok, `got ${chatResponse.status}`);

  if (chatResponse.ok) {
    const chatResult = (await chatResponse.json()) as any;
    const content = chatResult.choices?.[0]?.message?.content;
    assert("response has content", typeof content === "string" && content.length > 0);
    console.log(`  response: "${content}"`);
  }

  // ───────────────────────────────────────────
  // Test 3: @inngest/agent-kit — Adapter strips tools
  // ───────────────────────────────────────────
  console.log("\n=== 3. @inngest/agent-kit — Adapter (tools stripping) ===\n");

  const agenticModel = createAgenticModelFromAiAdapter(model);

  const mockMessages = [
    { type: "text", role: "user", content: "Hello" },
  ];
  const mockTools = [
    {
      name: "get_weather",
      description: "Get the weather",
      parameters: z.object({ city: z.string() }),
      handler: async () => "sunny",
    },
  ];

  const parsedRequest = agenticModel.requestParser(
    model,
    mockMessages as any,
    mockTools as any,
    "auto"
  );

  assert(
    "tools stripped from request",
    parsedRequest.tools === undefined,
    parsedRequest.tools
      ? `tools still present (${parsedRequest.tools.length} items)`
      : undefined
  );
  assert(
    "tool_choice stripped from request",
    parsedRequest.tool_choice === undefined,
    parsedRequest.tool_choice
      ? `tool_choice still present: '${parsedRequest.tool_choice}'`
      : undefined
  );
  assert(
    "messages preserved in request",
    Array.isArray(parsedRequest.messages) && parsedRequest.messages.length > 0
  );

  // ───────────────────────────────────────────
  // Test 4: End-to-end — Adapter + Live API
  // ───────────────────────────────────────────
  console.log("\n=== 4. End-to-end — Adapter + Live API ===\n");

  // Build a request through the adapter (with tools) and send it to Tzafon
  const e2eRequest = agenticModel.requestParser(
    model,
    mockMessages as any,
    mockTools as any,
    "auto"
  );
  e2eRequest.model ||= "tzafon.sm-1";

  const e2eResponse = await fetch(model.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${model.authKey}`,
    },
    body: JSON.stringify(e2eRequest),
  });

  assert(
    "adapter-processed request succeeds (tools stripped)",
    e2eResponse.ok,
    e2eResponse.ok
      ? undefined
      : `got ${e2eResponse.status}: ${await e2eResponse.text()}`
  );

  if (e2eResponse.ok) {
    const e2eResult = (await e2eResponse.json()) as any;
    const parsed = agenticModel.responseParser(e2eResult);
    assert(
      "response parser returns messages",
      Array.isArray(parsed) && parsed.length > 0
    );
    const firstMsg = parsed[0];
    const content =
      typeof firstMsg?.content === "string"
        ? firstMsg.content
        : Array.isArray(firstMsg?.content)
          ? firstMsg.content.find((c: any) => c.type === "text")?.text
          : null;
    assert("parsed response has text content", typeof content === "string" && content.length > 0);
    console.log(`  response: "${content}"`);
  }

  // ───────────────────────────────────────────
  // Summary
  // ───────────────────────────────────────────
  console.log("\n=============================");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log("=============================\n");

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
