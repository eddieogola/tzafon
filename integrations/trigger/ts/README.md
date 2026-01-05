# Tzafon + Trigger.dev Integration

This project demonstrates how to use [Tzafon](https://www.tzafon.ai/computer) with [Trigger.dev](https://trigger.dev/) to run browser automation tasks in the background.

## What is Tzafon?

[Tzafon](https://www.tzafon.ai/computer) is a **runtime for agent automation** built in Rust for AI automation at scale. It provides:

- **Lightweight performance**: 75x less CPU and 74% less memory than standard headless runtimes
- **Resilient under load**: 99.99% reliability and 4.8x faster cold starts
- **Isolated by design**: Each environment runs in a Firecracker micro-VM
- **Unified API surface**: Launch and scale Browser, Sandbox, and Linux from a single API

## What is Trigger.dev?

[Trigger.dev](https://trigger.dev/) is a background jobs platform that allows you to run long-running tasks reliably. It's perfect for browser automation, data processing, and other compute-intensive workloads.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager
- A [Trigger.dev](https://cloud.trigger.dev) account
- A [Tzafon](https://www.tzafon.ai/dashboard) account

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
TZAFON_API_KEY=your-api-key        # Get it from https://www.tzafon.ai/dashboard
TRIGGER_SECRET_KEY=your-secret-key # Get it from https://cloud.trigger.dev
```

### 3. Update Trigger.dev project ID

Edit `trigger.config.ts` and replace `your_project_id` with your actual project ID from the [Trigger.dev dashboard](https://cloud.trigger.dev/):

```typescript
export default defineConfig({
  project: "your_project_id", // Replace with your project ID
  // ...
});
```

## Running the Project

### Run the Trigger.dev dev server

Start the Trigger.dev development server to run your tasks locally:

```bash
pnpm dlx trigger.dev@latest dev
```

This command will:

1. Start the Trigger.dev dev server
2. Watch for changes in your `/src/trigger` directory
3. Register your tasks with the Trigger.dev dashboard

### Test your task

Once the dev server is running, you can test your task from the [Trigger.dev dashboard](https://cloud.trigger.dev):

1. Navigate to your project in the dashboard
2. Find the `screenshot-website` task
3. Click "Test" to run it

## Project Structure

```
.
├── src/
│   └── trigger/
│       └── screenshotWebsite.ts  # Example task that takes a screenshot
├── trigger.config.ts              # Trigger.dev configuration
├── .env.example                   # Example environment variables
├── package.json                   # Project dependencies
└── README.md                      # This file
```

## Example Task

The included `screenshotWebsite.ts` task demonstrates how to:

1. Create a Tzafon browser session
2. Connect to it using Puppeteer
3. Navigate to a webpage
4. Take a screenshot

```typescript
import { logger, task } from "@trigger.dev/sdk";
import puppeteer from "puppeteer";
import Computer from "tzafon";

const client = new Computer({
  apiKey: process.env.TZAFON_API_KEY,
});

export const screenshotWebsite = task({
  id: "screenshot-website",
  maxDuration: 60,
  run: async () => {
    // Create a Tzafon browser session
    const session = await client.create({ kind: "browser" });

    // Connect Puppeteer to the Tzafon browser
    const wssUrl = `ws://api.tzafon.ai/computers/${session.id}/ws?token=${process.env.TZAFON_API_KEY}`;
    const browser = await puppeteer.connect({ browserWSEndpoint: wssUrl });

    // Take a screenshot
    const page = await browser.newPage();
    await page.goto("https://tzafon.ai");
    await page.screenshot({ path: "tzafon.png" });

    await browser.close();
  },
});
```

## Deployment

To deploy your tasks to Trigger.dev cloud:

```bash
pnpm dlx trigger.dev@latest deploy
```

## Resources

- [Tzafon Documentation](https://docs.tzafon.ai)
- [Tzafon Dashboard](https://www.tzafon.ai/dashboard)
- [Trigger.dev Quick Start](https://trigger.dev/docs/quick-start)
- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Trigger.dev Cloud](https://cloud.trigger.dev)

## License

ISC
