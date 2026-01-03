# Mastra Agent Quickstart with Tzafon

Build AI-powered web automation agents with [Mastra](https://mastra.ai) and [Tzafon Computer](https://www.tzafon.ai/computer).

## What is Tzafon Computer?

[Tzafon Computer](https://www.tzafon.ai/computer) is a runtime for agent automation built in Rust for AI automation at scale. It provides:

- **Lightweight Performance** — 75x less CPU and 74% less memory than standard headless runtimes
- **Resilient Under Load** — 99.99% reliability and 4.8x faster cold starts
- **Isolated by Design** — Each environment runs in a Firecracker micro-VM for consistent performance
- **Unified API Surface** — Launch and scale Browser, Sandbox, and Linux from a single, unified API

## Prerequisites

### Get your Tzafon API Key

Get your API key from the [Tzafon Dashboard](https://tzafon.ai/dashboard).

```
TZAFON_API_KEY
```

### Get your OpenAI API Key

Get your key from the [OpenAI platform](https://platform.openai.com/api-keys).

```
OPENAI_API_KEY
```

## Quick Start

### 1. Clone or Create the Project

```bash
mkdir tzafon-mastra-agent
cd tzafon-mastra-agent
npm init -y
```

### 2. Install Dependencies

```bash
# Using npm
npm install @mastra/core mastra @ai-sdk/openai tzafon zod dotenv
npm install -D @types/node tsx typescript

# Using pnpm
pnpm install @mastra/core mastra @ai-sdk/openai tzafon zod dotenv
pnpm install -D @types/node tsx typescript
```

### 3. Create the Tzafon Client

```typescript
// src/core/client.ts
import dotenv from "dotenv";
import Computer, { ComputerSession } from "tzafon";

dotenv.config();

if (!process.env.TZAFON_API_KEY) {
  throw new Error("TZAFON_API_KEY is required");
}

class TzafonBrowser {
  client: Computer;
  session?: ComputerSession;

  constructor() {
    this.client = new Computer({ apiKey: process.env.TZAFON_API_KEY });
  }

  async createSession() {
    this.session = await this.client.create({
      kind: "browser",
    });
    return this.session;
  }

  async getSession() {
    if (!this.session) {
      this.session = await this.createSession();
    }
    return this.session;
  }

  async terminateSession() {
    if (this.session) {
      await this.session.terminate();
      this.session = undefined;
    }
  }
}

export const tzafonBrowser = new TzafonBrowser();
```

### 4. Create the Tzafon Tools

```typescript
// src/tools/index.ts
import { tzafonBrowser } from "@/core/client";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Find more Tzafon actions at: https://docs.tzafon.ai
 */

export const tzafonNavigateTool = createTool({
  id: "tzafon-navigate",
  description: "Navigate to a URL",
  inputSchema: z.object({
    url: z.string().describe("URL to navigate to"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    let browserSession = await tzafonBrowser.getSession();
    const url = context.url;

    try {
      await browserSession.navigate(url);
      await browserSession.wait(2);
      return {
        success: true,
        message: `Successfully navigated to: ${url}`,
      };
    } catch (error: any) {
      await tzafonBrowser.terminateSession();
      throw new Error(`Tzafon navigation failed: ${error.message}`);
    }
  },
});

export const tzafonScreenshotTool = createTool({
  id: "tzafon-screenshot",
  description: "Take a screenshot of the current page",
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async () => {
    const browserSession = await tzafonBrowser.getSession();

    try {
      const result = await browserSession.screenshot();
      const screenshotUrl = result.result?.screenshot_url;
      return {
        success: true,
        message: `Screenshot taken successfully: The url to the screenshot is ${screenshotUrl}`,
      };
    } catch (error: any) {
      await tzafonBrowser.terminateSession();
      throw new Error(`Tzafon screenshot failed: ${error.message}`);
    }
  },
});
```

### 5. Create the Web Agent

```typescript
// src/agents/index.ts
import { tzafonNavigateTool, tzafonScreenshotTool } from "@/tools";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

const model = openai("gpt-4o");

export const webAgent = new Agent({
  name: "Web Assistant",
  instructions: `
    You are a helpful web assistant that can navigate websites and extract information.
    Use the tzafonNavigateTool to navigate to a URL.
    Use the tzafonScreenshotTool to take a screenshot of the current page.
  `,
  model: model,
  tools: {
    tzafonNavigateTool,
    tzafonScreenshotTool,
  },
});
```

### 6. Initialize Mastra

```typescript
// src/mastra/index.ts
import { webAgent } from "@/agents";
import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

export const mastra = new Mastra({
  agents: { webAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
```

### 7. Configure Environment

Create a `.env` file in your project root:

```env
TZAFON_API_KEY=your_tzafon_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 8. Start the Agent

Add the dev script to your `package.json`:

```json
{
  "scripts": {
    "dev": "mastra dev"
  }
}
```

Run the development server:

```bash
npm run dev

# or with pnpm
pnpm dev
```

## How It Works

The Tzafon + Mastra integration provides:

- **Navigate**: Navigate to any URL using Tzafon's stealth browser
- **Screenshot**: Capture screenshots of the current page state
- **Extensible**: Add more Tzafon actions as tools for your agent

## Try These Commands

Once the agent is running, try these example prompts:

```
"Navigate to https://example.com and take a screenshot"
```

```
"Go to https://news.ycombinator.com and screenshot the current page"
```

```
"Visit https://github.com and capture what you see"
```

## Extending the Agent

You can add more Tzafon tools by exploring the available actions in the [Tzafon documentation](https://docs.tzafon.ai). Common actions include:

- `navigate(url)` - Navigate to a URL
- `screenshot()` - Take a screenshot
- `click(selector)` - Click an element
- `type(text)` - Type text
- `scroll(direction)` - Scroll the page
- `wait(seconds)` - Wait for a duration

## Next Steps

- **Custom Instructions**: Modify the agent's behavior in `src/agents/index.ts`
- **Add Tools**: Create additional tools for specific automation needs in `src/tools/index.ts`
- **Production Setup**: Add proper error handling and logging for production use

## Resources

- [Tzafon Computer](https://www.tzafon.ai/computer) — Learn more about Tzafon's runtime for agent automation
- [Tzafon Documentation](https://docs.tzafon.ai) — Full API reference and guides
- [Tzafon Dashboard](https://tzafon.ai/dashboard) — Manage your API keys and monitor usage
- [Mastra Documentation](https://mastra.ai/docs) — Learn more about building AI agents with Mastra

## License

ISC
