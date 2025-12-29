import client from "@/core/client";
import executeAction from "@/tools/executeAction";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

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

const getServer = async () => {
  const computer = await client.create({ kind: "browser" });

  server.registerTool(
    "execute_action",
    {
      title: "Execute Action",
      description: "Execute an action on a Tzafon client",
      inputSchema: {
        action: z.object({
          type: z.enum(["navigate", "screenshot"]),
          url: z.string().optional(),
        }),
      },
    },
    async ({ action }): Promise<CallToolResult> => {
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
