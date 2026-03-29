import Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";

async function mastraAgentWithBrowserTool(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Mastra: Agent with Lightcone Browser Tool ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/integrations/mastra/#example${Colors.RESET}\n`,
  );
  try {
    // @ts-ignore — optional peer dependency, install with: npm install mastra @ai-sdk/openai
    const { Agent } = await import("mastra");
    // @ts-ignore
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
      name: "Web Researcher",
      instructions: "You are a helpful assistant that can browse the web.",
      model: tzafon("tzafon.northstar-cua-fast"),
      tools: { browse_web: browseWebTool },
    });

    const response = await agent.generate(
      "Visit https://news.ycombinator.com and describe the top stories",
    );
    console.log(response.text);
  } catch (e) {
    console.error(
      `\n${Colors.RED}Error in Mastra agent example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function mastraIntegration(
  client: Lightcone,
): Promise<void> {
  await mastraAgentWithBrowserTool(client);
}
