import getServer from "@/core/server";
import { logger } from "@/core/telemetry";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const transport = new StdioServerTransport();
  const server = getServer();
  await server.connect(transport);
  logger.info("Tzafon MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
