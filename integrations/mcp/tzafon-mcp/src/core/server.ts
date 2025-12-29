import client from "@/core/client";
import executeAction from "@/tools/executeAction";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

const getServer = async () => {
  const server = new McpServer(
    {
      name: "tzafon",
      version: "1.0.0",
      websiteUrl: "https://tzafon.ai",
    },
    {
      capabilities: {
        logging: {},
        tools: {
          listChanged: true,
        },
      },
    }
  );
  const VIEWPORT_WIDTH = 1920;
  const VIEWPORT_HEIGHT = 1080;

  const computer = await client.create({ kind: "browser" });
  await computer.setViewport(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

  server.registerTool(
    "execute_action",
    {
      title: "Execute Action",
      description: "Execute an action on a Tzafon client",
      inputSchema: {
        action: z.object({
          type: z.enum(["navigate", "screenshot", "click", "wait"]),
          url: z.string().optional().describe("URL to navigate to"),
          x: z
            .number()
            .optional()
            .describe(
              "X coordinate of the viewport (0-" + VIEWPORT_WIDTH + ")"
            ),
          y: z
            .number()
            .optional()
            .describe(
              "Y coordinate of the viewport (0-" + VIEWPORT_HEIGHT + ")"
            ),
          seconds: z
            .number()
            .optional()
            .describe(
              "Seconds to wait for page to load usually 2 seconds is enough, used with the wait action type"
            ),
        }),
      },
    },
    async ({ action }): Promise<CallToolResult> => {
      await computer.keepAlive();
      const result = await executeAction({ computer, action });

      if (result.status === "success") {
        switch (action.type) {
          case "navigate":
            return {
              content: [{ type: "text", text: "Navigated to " + action.url }],
            };
          case "screenshot":
            return {
              content: [
                {
                  type: "text",
                  text:
                    "Screenshot taken " + result.data?.result?.screenshot_url,
                },
              ],
            };
          case "click":
            return {
              content: [
                {
                  type: "text",
                  text: "Clicked at " + action.x + ", " + action.y,
                },
              ],
            };
          case "wait":
            return {
              content: [
                {
                  type: "text",
                  text: "Waited for " + action.seconds + " seconds",
                },
              ],
            };
        }
      } else {
        return {
          content: [{ type: "text", text: result.message || "Action failed" }],
          isError: true,
        };
      }
    }
  );

  return server;
};

export default getServer;
