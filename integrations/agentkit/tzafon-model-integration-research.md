# Research: Integrating Tzafon as a Model Provider in AgentKit

## Context

Tzafon currently has a **tool-based integration** in AgentKit (browser automation via Playwright/CDP). The goal is to also make Tzafon a **first-class model provider** — so Tzafon's LLM models can power AgentKit agents directly, alongside OpenAI, Anthropic, Gemini, and Grok.

**Key constraint**: Tzafon does NOT support tool/function calling yet (text-only).

---

## 1. Tzafon Chat Completions API Summary

| Property | Value |
|----------|-------|
| Base URL | `https://api.tzafon.ai/v1` |
| Endpoint | `POST /chat/completions` |
| Auth | `Authorization: Bearer sk_...` |
| Compatibility | OpenAI-compatible |
| Models | `tzafon.sm-1` (general), `tzafon.northstar-cua-fast` (CUA) |
| Streaming | SSE (OpenAI-compatible) |
| Tool calling | **Not supported** |
| Pricing | $0.20-0.30/1M input, $0.30-0.50/1M output |

### Request Parameters

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `model` | string | Yes | e.g., `tzafon.sm-1` |
| `messages` | array | Yes | `{role, content}` objects |
| `temperature` | number | No | 0-2, default 1 |
| `max_tokens` | number | No | Output limit |
| `stream` | boolean | No | SSE streaming |
| `stop` | array | No | Stop sequences |

### Response Format (OpenAI-compatible)

```json
{
  "id": "...",
  "object": "chat.completion",
  "model": "tzafon.sm-1",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "..." },
    "finish_reason": "stop"
  }],
  "usage": { "prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30 }
}
```

### Available Models

| Model | Purpose | Input Price | Output Price |
|-------|---------|-------------|--------------|
| `tzafon.sm-1` | General tasks, fast responses | $0.20/1M tokens | $0.30/1M tokens |
| `tzafon.northstar-cua-fast` | Computer-use / automation agents | $0.30/1M tokens | $0.50/1M tokens |

### Additional Endpoints

- `GET /v1/models` — List available models
- `POST /v1/completions` — Legacy text completion
- `POST /v1/embeddings` — Vector embeddings

### Key Compatibility Notes

- **OpenAI SDK compatible** — works by changing `baseURL` to `https://api.tzafon.ai/v1`
- **Streaming**: Uses standard SSE format (same as OpenAI)
- **Tool/function calling**: **NOT supported**. The API does not accept `tools`, `tool_calls`, or `function_calling` parameters.
- **Error codes**: Standard HTTP — 200 (success), 400 (bad request), 401 (unauthorized), 429 (rate limit), 500+ (server error)

### Sources

- [Chat Completions](https://docs.tzafon.ai/core-concepts/chat-completions)
- [API Reference: Chat](https://docs.tzafon.ai/api-reference/completions/chat)
- [API Reference: Models](https://docs.tzafon.ai/api-reference/completions/models)
- [API Introduction](https://docs.tzafon.ai/api-reference/introduction)
- [Pricing](https://docs.tzafon.ai/pricing)

---

## 2. AgentKit Model Provider Architecture

AgentKit's model system has **two layers**:

### Layer 1: `@inngest/ai` Package (Model Creators + Types)

External npm package (`@inngest/ai@0.1.6`) that provides:

- **Model creator functions**: `openai()`, `anthropic()`, `gemini()`, `grok()`, `deepseek()`
- Each returns an `AiAdapter` object with: `url`, `authKey`, `format`, `onCall()`, `headers`, `options`
- **`AiAdapter.Format`** union type: `"openai-chat" | "anthropic" | "gemini" | "grok" | "azure-openai"`
- **`AiAdapters`** type map: format string → adapter type
- **Environment variable handling**: `envKeys` enum with keys like `OPENAI_API_KEY`, `XAI_API_KEY`, etc.

### Layer 2: `@inngest/agent-kit` Package (Parsers + Inference)

This repo provides:

- **`src/adapters/`** — Request/response parsers per format (openai, anthropic, gemini, grok, azure-openai)
- **`src/adapters/index.ts`** — Central registry: `adapters[format] = { request, response }`
- **`src/model.ts`** — `AgenticModel` class that orchestrates inference (builds HTTP request, sets auth headers per format, calls parsers)
- **`src/models.ts`** — Re-exports model creators from `@inngest/ai`

### Key Files

| File | Purpose |
|------|---------|
| `packages/agent-kit/src/model.ts` | `AgenticModel` class, inference execution, format-specific auth headers |
| `packages/agent-kit/src/models.ts` | Re-exports `openai`, `anthropic`, `gemini`, `grok` from `@inngest/ai` |
| `packages/agent-kit/src/adapters/index.ts` | Central adapter registry (format → request/response parsers) |
| `packages/agent-kit/src/adapters/openai.ts` | OpenAI request/response parsers (218 lines) |
| `packages/agent-kit/src/adapters/grok.ts` | Grok adapter — wraps OpenAI, disables strict mode (49 lines) |
| `packages/agent-kit/src/adapters/azure-openai.ts` | Azure adapter — wraps OpenAI (25 lines) |
| `packages/agent-kit/src/adapters/anthropic.ts` | Anthropic adapter (202 lines) |
| `packages/agent-kit/src/adapters/gemini.ts` | Gemini adapter (290 lines) |
| `packages/agent-kit/src/types.ts` | Internal `Message` type definitions |

---

## 3. Existing Provider Patterns (Reference)

### Pattern A: Grok (OpenAI-compatible with custom format)

Grok has its **own format** (`"grok"`) and its **own adapter** entry, even though it reuses OpenAI's I/O types:

**In `@inngest/ai` (`models/grok.js`):**
```javascript
const grok = (options) => {
    const apiKey = options.apiKey || processEnv("XAI_API_KEY");
    const baseUrl = options.baseUrl || "https://api.x.ai/v1";
    const adapter = openai({ ...options, apiKey, baseUrl, model: options.model });
    adapter.format = "grok"; // Override format from "openai-chat" to "grok"
    return adapter;
};
```

**In `agent-kit` (`adapters/grok.ts`):**
```typescript
// Wraps OpenAI parsers, disables strict mode (Grok doesn't support it)
export const requestParser = (model, messages, tools, tool_choice) => {
    const request = openaiRequestParser(model, messages, tools, tool_choice);
    request.tools = (request.tools || []).map(tool => ({
        ...tool, function: { ...tool.function, strict: false }
    }));
    return request;
};
export const responseParser = openaiResponseParser; // Direct reuse
```

**Requires changes to**: `AiAdapter.Format` type, `AiAdapters` map, `adapters/index.ts`, `model.ts` format handlers.

### Pattern B: DeepSeek (OpenAI-compatible, reuses format entirely)

DeepSeek uses `format: "openai-chat"` directly — **no custom format, no custom adapter, no changes to format types**:

**In `@inngest/ai` (`models/deepseek.js`):**
```javascript
const deepseek = (options) => {
    const authKey = options.apiKey || processEnv("DEEPSEEK_API_KEY") || "";
    let baseUrl = options.baseUrl || "https://api.deepseek.com/v1/";
    if (!baseUrl.endsWith("/")) baseUrl += "/";
    const url = new URL("chat/completions", baseUrl);
    return {
        url: url.href,
        authKey,
        format: "openai-chat",  // Reuses OpenAI format entirely!
        onCall(_, body) {
            Object.assign(body, options.defaultParameters);
            body.model || (body.model = options.model);
        },
        options,
    };
};
```

**Requires NO changes to**: `adapter.d.ts`, `adapters/`, `adapters/index.ts`, `adapters/index.d.ts`, `model.ts`.

### Pattern C: Azure OpenAI (OpenAI-compatible with different auth)

Azure wraps OpenAI but uses a different auth header (`api-key` instead of `Authorization: Bearer`), requiring its own format:

```typescript
// adapters/azure-openai.ts — just delegates to OpenAI parsers
export const requestParser = (model, messages, tools, tool_choice) =>
    openaiRequestParser(model, messages, tools, tool_choice);
export const responseParser = (output) => openaiResponseParser(output);
```

---

## 4. ~~Recommended Integration Pattern: DeepSeek~~ → Actual: Grok Pattern

**Originally planned** to follow the DeepSeek pattern (reuse `"openai-chat"` format). However, testing revealed that **Tzafon rejects `tools`/`tool_choice` with HTTP 400**, requiring a custom adapter.

**Actual pattern: Grok** — custom `"tzafon"` format with a dedicated adapter that:
1. Wraps OpenAI request/response parsers
2. Strips `tools` and `tool_choice` from the request body
3. Uses `Authorization: Bearer` auth (same as OpenAI)

---

## 5. Implementation Plan

### Layer 1: `@inngest/ai` Package Changes

This is an **external npm dependency**. Changes must be made upstream (PR to the `@inngest/ai` repo).

#### New: `models/tzafon.js`

```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tzafon = void 0;
const env_1 = require("../env");

const tzafon = (options) => {
    const authKey = options.apiKey || (0, env_1.processEnv)(env_1.envKeys.TzafonApiKey) || "";
    let baseUrl = options.baseUrl || "https://api.tzafon.ai/v1/";
    if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
    }
    const url = new URL("chat/completions", baseUrl);
    return {
        url: url.href,
        authKey,
        format: "openai-chat",
        onCall(_, body) {
            Object.assign(body, options.defaultParameters);
            body.model || (body.model = options.model);
        },
        options,
    };
};
exports.tzafon = tzafon;
```

#### New: `models/tzafon.d.ts`

```typescript
import { type AiAdapter } from "../adapter.js";
import { type OpenAiAiAdapter } from "../adapters/openai.js";

export declare const tzafon: AiAdapter.ModelCreator<
    [options: Tzafon.AiModelOptions],
    Tzafon.AiModel
>;

export declare namespace Tzafon {
    type Model = (string & {}) | "tzafon.sm-1" | "tzafon.northstar-cua-fast";

    interface AiModelOptions {
        model: Model;
        apiKey?: string;
        baseUrl?: string;
        defaultParameters?: Partial<AiAdapter.Input<AiModel>>;
    }

    interface AiModel extends OpenAiAiAdapter {
        options: AiModelOptions;
    }
}
```

#### Modify: `env.js` — Add env key

```javascript
// Add to envKeys enum:
envKeys["TzafonApiKey"] = "TZAFON_API_KEY";
```

#### Modify: `models/index.js` + `models/index.d.ts` — Add export

```javascript
// Add to both files:
__exportStar(require("./tzafon.js"), exports);
// or: export * from "./tzafon.js";
```

#### ~~What does NOT change in `@inngest/ai`~~ — Updated: These DO change

After discovering Tzafon rejects `tools`, the integration was changed to follow the Grok pattern:

- `adapter.ts` — **Changed**: Add `"tzafon"` to `Format` union and `AiAdapters` map
- `adapters/tzafon.ts` — **New**: `TzafonAiAdapter` interface (extends `AiAdapter`, format `"tzafon"`, reuses OpenAI I/O types)
- `adapters/index.ts` — **Changed**: Export `TzafonAiAdapter`
- PR: [inngest/inngest-js#1309](https://github.com/inngest/inngest-js/pull/1309)

### Layer 2: `@inngest/agent-kit` Package Changes (This Repo)

#### Modify: `src/models.ts`

```typescript
// Before:
export { anthropic, gemini, openai, grok } from "@inngest/ai";

// After:
export { anthropic, gemini, openai, grok, tzafon } from "@inngest/ai";
```

#### ~~No other code changes needed~~ — Updated: Adapter required

After discovering Tzafon rejects `tools`, additional changes are needed:

- `src/adapters/tzafon.ts` — **New**: Custom adapter wrapping OpenAI parsers, strips `tools`/`tool_choice`
- `src/adapters/index.ts` — **Changed**: Register Tzafon adapter
- `src/model.ts` — **Changed**: Add `tzafon` format handler (`Authorization: Bearer` auth)
- PR: [inngest/agent-kit#289](https://github.com/inngest/agent-kit/pull/289)

#### Documentation changes

1. **New: `docs/reference/model-tzafon.mdx`** — Model reference page
2. **Modify: `docs/concepts/models.mdx`** — Add Tzafon to supported providers
3. **Modify: `docs/docs.json`** — Add navigation entry
4. **Modify: `docs/integrations/tzafon.mdx`** — Mention Tzafon as both tool AND model provider

---

## 6. Alternative: Inline in `agent-kit` (If Upstream Is Slow)

If we can't wait for `@inngest/ai` changes, we can create the `tzafon()` creator directly in `agent-kit`:

```typescript
// packages/agent-kit/src/models/tzafon.ts
import type { AiAdapter } from "@inngest/ai";

interface TzafonOptions {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  defaultParameters?: Record<string, unknown>;
}

export const tzafon = (options: TzafonOptions): AiAdapter => {
  const authKey = options.apiKey || process.env.TZAFON_API_KEY || "";
  let baseUrl = options.baseUrl || "https://api.tzafon.ai/v1/";
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  const url = new URL("chat/completions", baseUrl);

  return {
    url: url.href,
    authKey,
    format: "openai-chat" as AiAdapter.Format,
    onCall(_, body) {
      Object.assign(body, options.defaultParameters);
      body.model ||= options.model;
    },
    options,
    "~types": {} as any,
  };
};
```

This works because the adapter returns `format: "openai-chat"`, so all existing OpenAI parsers and auth handlers apply automatically.

---

## 7. Tool Calling Limitation

Since Tzafon doesn't support tool/function calling:

- Agents using Tzafon models will only produce **text responses**
- They **cannot invoke AgentKit tools**
- Still useful for: text generation, simple routing, system prompts, conversational agents

### ~~Risk: Does Tzafon error on `tools` parameter?~~ — Resolved

**Tested and confirmed**: Tzafon **rejects** requests with `tools` parameter (HTTP 400). A custom adapter was implemented in `agent-kit` that strips `tools` and `tool_choice` from all requests to Tzafon, following the Grok pattern.

---

## 8. Expected Usage After Integration

```typescript
import { createAgent, createNetwork, tzafon } from "@inngest/agent-kit";

const agent = createAgent({
  name: "search_assistant",
  system: "You are a helpful assistant.",
  model: tzafon({ model: "tzafon.sm-1" }),
});

const network = createNetwork({
  agents: [agent],
  defaultModel: tzafon({
    model: "tzafon.northstar-cua-fast",
    apiKey: process.env.TZAFON_API_KEY,
    defaultParameters: { temperature: 0.7, max_tokens: 2048 },
  }),
});
```

Environment variable: `TZAFON_API_KEY`

---

## 9. Open Questions

1. ~~**Does Tzafon error or silently ignore `tools` in the request body?**~~ — **Resolved.** Tzafon **rejects** it with HTTP 400: `"auto" tool choice requires --enable-auto-tool-choice and --tool-call-parser to be set`. A custom adapter is needed to strip `tools` and `tool_choice` from requests (follow the Grok pattern).
2. ~~**Where is the source repo for `@inngest/ai`?**~~ — **Resolved.** It's in the [inngest/inngest-js](https://github.com/inngest/inngest-js) monorepo at `packages/ai/`.
3. ~~**Should we start with Option A (upstream PR) or Option B (inline in agent-kit)?**~~ — **Resolved.** Went with Option A — upstream PR submitted: [inngest/inngest-js#1309](https://github.com/inngest/inngest-js/pull/1309).
4. **What are context window sizes for Tzafon models?** — Not documented anywhere.
5. **TypeScript SDK package rename**: Docs show `@tzafon/computer` (newer) vs `tzafon` (in existing example). Should we update the existing tool integration too?

---

## 10. Summary

| Aspect | Detail |
|--------|--------|
| Pattern followed | **Grok** (custom format + adapter that modifies requests) |
| Format | `"tzafon"` (custom format, uses OpenAI I/O types) |
| Custom adapter | Yes — strips `tools` and `tool_choice` from requests |
| `@inngest/ai` changes | Model creator + adapter type + format registration + env key (~6 files) |
| `@inngest/ai` PR | [inngest/inngest-js#1309](https://github.com/inngest/inngest-js/pull/1309) |
| `agent-kit` changes | Re-export + adapter + adapter registration + format handler (~4 files) |
| `agent-kit` PR | [inngest/agent-kit#289](https://github.com/inngest/agent-kit/pull/289) |
| Key limitation | No tool/function calling support |
| Status | PRs submitted, `agent-kit` PR blocked on `@inngest/ai` PR merge |
