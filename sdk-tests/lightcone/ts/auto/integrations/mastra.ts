import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";

const PAGE = "integrations/mastra";

const mastraAgentWithBrowserTool = example(
  {
    page: PAGE,
    anchor: "example",
    title: "Mastra: Agent with Lightcone Browser Tool",
  },
  async (client: Lightcone): Promise<void> => {
    const { Agent } = await import("@mastra/core/agent");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const tzafon = createOpenAI({
      baseURL: "https://api.tzafon.ai/v1",
      apiKey: process.env.TZAFON_API_KEY!,
    });

    const browseWebTool = {
      name: "browse_web",
      description: "Visit a URL, interact with the page, and take a screenshot",
      parameters: {
        url: { type: "string" as const, description: "URL to visit" },
      },
      execute: async ({ url }: { url: string }) => {
        const computer = await client.computers.create({ kind: "browser" });
        const id = computer.id!;

        await client.computers.navigate(id, { url });
        const result = await client.computers.screenshot(id);
        await client.computers.delete(id);

        return { screenshot: result.result?.screenshot_url };
      },
    };

    const agent = new Agent({
      id: "web-researcher",
      name: "Web Researcher",
      instructions: "You are a helpful assistant that can browse the web.",
      // Use .chat() to target /v1/chat/completions. The bare `tzafon(id)`
      // helper defaults to the OpenAI Responses API (/v1/responses), whose
      // multi-turn tool payloads currently 500 on Tzafon with "'role'".
      model: tzafon.chat("tzafon.northstar-cua-fast-1.6"),
      tools: { browse_web: browseWebTool },
    });

    const response = await agent.generate(
      "Visit https://news.ycombinator.com and describe the top stories",
    );
    console.log(response.text);
  },
);

export default async function mastraIntegration(
  client: Lightcone,
): Promise<void> {
  await mastraAgentWithBrowserTool(client);
}
