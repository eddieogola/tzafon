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
