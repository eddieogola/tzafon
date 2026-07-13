import Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

async function vercelAiToolCalling(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Vercel AI SDK: Tool Calling with Lightcone ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/integrations/vercel-ai/#example${Colors.RESET}\n`,
  );
  try {
    const { generateText, tool } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const tzafon = createOpenAI({
      baseURL: "https://api.tzafon.ai/v1",
      apiKey: process.env.TZAFON_API_KEY!,
    });

    const result = await generateText({
      // .chat() targets /v1/chat/completions; the bare `tzafon(id)` helper
      // defaults to the Responses API (/v1/responses), which 500s ("'role'")
      // on Tzafon once a tool round-trip is in the payload.
      model: tzafon.chat("tzafon.northstar-cua-fast"),
      tools: {
        browse: tool({
          description: "Visit a URL and take a screenshot of the page",
          parameters: {
            url: { type: "string", description: "The URL to visit" },
          },
          execute: async ({ url }: { url: string }) => {
            const computer = await client.computers.create({ kind: "browser" });
            const id = computer.id!;

            await client.computers.navigate(id, { url });
            const res = await client.computers.screenshot(id);
            await client.computers.delete(id);

            return { screenshot: res.result?.screenshot_url };
          },
        }),
      },
      prompt: "Visit https://news.ycombinator.com and describe what you see",
    });
    console.log(result);
    console.log(result.text);
  } catch (e) {
    console.error(
      `\n${Colors.RED}Error in Vercel AI tool calling example: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function vercelAiIntegration(
  client: Lightcone,
): Promise<void> {
  await vercelAiToolCalling(client);
}
