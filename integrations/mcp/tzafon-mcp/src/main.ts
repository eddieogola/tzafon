import server from "@/core/server";
import executeAction from "@/tools/executeAction";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

server.registerTool(
  "execute_action",
  {
    description: "Execute an action",
    inputSchema: {
      action: z.object({
        type: z.enum(["navigate"]),
        url: z.string(),
      }),
    },
  },
  async ({ action }) => {
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Tzafon MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
