import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, tool } from "ai";
import dotenv from "dotenv";
import { chromium } from "playwright-core";
import Computer from "tzafon";
import { z } from "zod";

dotenv.config();

const TZAFON_API_KEY = process.env.TZAFON_API_KEY;
const BASE_URL = "https://api.tzafon.ai";

// Initialize Tzafon client
const client = new Computer({
  apiKey: TZAFON_API_KEY,
});

// Create a tool to search Wikipedia using Tzafon
const searchWikipedia = tool({
  description: "Search Wikipedia for relevant information on a given topic",
  inputSchema: z.object({
    query: z.string().describe("The search query for Wikipedia"),
  }),
  execute: async ({ query }) => {
    console.log(`🔍 Searching Wikipedia for: "${query}"`);

    // Create a new browser session via Tzafon
    const session = await client.create({ kind: "browser" });
    const cdpUrl = `${BASE_URL}/computers/${session.id}/cdp?token=${TZAFON_API_KEY}`;

    // Connect to the session
    const browser = await chromium.connectOverCDP(cdpUrl);
    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Navigate to Wikipedia search
      await page.goto("https://en.wikipedia.org/wiki/Special:Search");

      // Find and fill the search box
      const searchBox = await page.$("#ooui-php-1");
      await searchBox?.click();
      await searchBox?.fill(query);

      // Click the search button
      await page
        .getByLabel("Search", { exact: true })
        .getByRole("button", { name: "Search", exact: true })
        .click();

      await page.waitForLoadState("networkidle");

      // Click on the first search result
      const firstResultLink = await page
        .locator("div.mw-search-results-container")
        .locator("ul.mw-search-results")
        .locator("li")
        .first()
        .locator("div.mw-search-result-heading")
        .locator("a");

      await firstResultLink.click();
      await page.waitForLoadState("networkidle");

      // Get the page title and main content
      const title = await page.title();
      const content = await page.evaluate(() => {
        const contentDiv = document.querySelector("#mw-content-text");
        if (!contentDiv) return "";

        // Get text from paragraphs only for cleaner output
        const paragraphs = contentDiv.querySelectorAll("p");
        const textContent = Array.from(paragraphs)
          .map((p) => p.textContent?.trim())
          .filter((text) => text && text.length > 50)
          .slice(0, 5) // Limit to first 5 significant paragraphs
          .join("\n\n");

        return textContent;
      });

      console.log(`✅ Found Wikipedia article: "${title}"`);

      return {
        title,
        content: content.slice(0, 4000), // Limit content length for LLM context
        url: page.url(),
      };
    } finally {
      await browser.close();
      await session.terminate();
      console.log("🔚 Browser session closed");
    }
  },
});

const model = openai("gpt-4o");

async function main() {
  const userQuery =
    process.argv[2] || "What is the history of artificial intelligence?";

  console.log(`\n🚀 Starting Wikipedia search with Vercel AI SDK`);
  console.log(`📝 User query: "${userQuery}"\n`);

  try {
    const { text, steps } = await generateText({
      model: model,
      system: `You are a helpful research assistant that uses Wikipedia to find accurate information. 
When given a question, use the search_wikipedia tool to find relevant information, then provide a clear and concise answer based on the search results.
Always cite the Wikipedia source in your response.`,
      tools: {
        search_wikipedia: searchWikipedia,
      },
      stopWhen: stepCountIs(5),
      prompt: userQuery,
    });

    console.log("\n📖 === AI Response ===\n");
    console.log(text);

    // Log tool usage information from steps
    if (steps && steps.length > 0) {
      const allToolCalls = steps.flatMap((step) => step.toolCalls);
      const allToolResults = steps.flatMap((step) => step.toolResults);

      if (allToolCalls.length > 0) {
        console.log("\n🔧 === Tool Calls ===");
        allToolCalls.forEach((call, index) => {
          console.log(`${index + 1}. ${call.toolName}:`, call.toolCallId);
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
