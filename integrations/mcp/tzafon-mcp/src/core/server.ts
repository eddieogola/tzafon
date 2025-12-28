import { logger } from "@/core/telemetry";
import executeAction from "@/tools/executeAction";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

const getServer = () => {
  const server = new McpServer({
    name: "tzafon",
    version: "1.0.0",
    websiteUrl: "https://tzafon.ai",
  });

  server.registerTool(
    "execute_action",
    {
      title: "Execute Action",
      description: "Execute an action on a Tzafon client",
      inputSchema: {
        action: z.object({
          type: z.enum(["navigate"]),
          url: z.string(),
        }),
      },
    },
    async ({ action }): Promise<CallToolResult> => {
      const result = await executeAction(action);

      if (result) {
        return {
          content: [{ type: "text", text: "Action executed successfully" }],
        };
      } else {
        return {
          content: [{ type: "text", text: "Action failed" }],
        };
      }
    }
  );

  logger.debug("Registered execute_action tool");

  return server;
};

export default getServer;
