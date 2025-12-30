# Braintrust + Tzafon Integration (TypeScript)

This example demonstrates how to create a [Braintrust](https://www.braintrust.dev/) tool that uses [Tzafon](https://www.tzafon.ai/computer) for browser automation.

## What is Tzafon?

Tzafon is a runtime for agent automation, built in Rust for AI automation at scale. It provides:

- **Lightweight performance** — 75x less CPU and 74% less memory than standard headless runtimes
- **Resilient under load** — 99.99% reliability and 4.8x faster cold starts
- **Isolated by design** — Each environment runs in a Firecracker micro-VM
- **Unified API surface** — Launch and scale Browser, Sandbox, and Linux from a single API

Learn more at [tzafon.ai/computer](https://www.tzafon.ai/computer).

## Prerequisites

- Node.js 18+
- A Tzafon API key
- A Braintrust API key

## Setup

### 1. Install dependencies

```bash
npm install braintrust tzafon zod dotenv
```

Or with pnpm:

```bash
pnpm add braintrust tzafon zod dotenv
```

### 2. Get your Tzafon API Key

1. Go to the [Tzafon Dashboard](https://tzafon.ai/dashboard)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key or copy your existing one

### 3. Get your Braintrust API Key

1. Go to [Braintrust](https://www.braintrust.dev/)
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create a new API key

### 4. Configure environment variables

Create a `.env` file in the project root:

```bash
TZAFON_API_KEY=your_tzafon_api_key_here
BRAINTRUST_API_KEY=your_braintrust_api_key_here
```

## Usage

### Running locally

To test the tool locally:

```bash
npx ts-node main.ts
```

Or with tsx:

```bash
npx tsx main.ts
```

### Pushing to Braintrust

To deploy your tool to Braintrust, use the `braintrust push` command:

```bash
npx braintrust push main.ts
```

This will:

1. Bundle your code and dependencies using `esbuild`
2. Upload the tool to your Braintrust project
3. Make it available in the Braintrust UI

Once pushed, you can:

- **View the tool** in the Braintrust UI under your project's Tools section
- **Add it to prompts** for use in AI workflows
- **Call it from code** using the Braintrust SDK

### Using the Tool in Code

After pushing, you can invoke the tool programmatically:

```typescript
import * as braintrust from "braintrust";

const client = braintrust.init();
const result = await client.invokeTool({
  project: "TZAFON API Tool - TypeScript",
  slug: "load-page",
  input: { url: "https://example.com" },
});
console.log(result);
```

## How it Works

The `loadPage` tool:

1. Creates a Tzafon browser session
2. Navigates to the specified URL
3. Waits for the page to load
4. Extracts and returns the HTML content

```typescript
async function loadPage({ url }: { url: string }) {
  const client = new Computer({
    apiKey: TZAFON_API_KEY,
  });
  const browser = await client.create({ kind: "browser" });

  try {
    await browser.navigate(url);
    await browser.wait(1);
    const result = await browser.getHTML();
    return { page: result.result?.html_content };
  } finally {
    await browser.terminate();
  }
}
```

## Resources

- [Tzafon Documentation](https://docs.tzafon.ai)
- [Tzafon Computer Runtime](https://www.tzafon.ai/computer)
- [Braintrust Tools Documentation](https://www.braintrust.dev/docs/core/functions/tools)
- [Braintrust TypeScript SDK](https://www.braintrust.dev/docs/reference/sdks/typescript)
