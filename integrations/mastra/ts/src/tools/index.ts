import { tzafonBrowser } from "@/core/client";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Find more Tzafon actions that can be turned to tools here: https://tzafon.dev/docs
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
