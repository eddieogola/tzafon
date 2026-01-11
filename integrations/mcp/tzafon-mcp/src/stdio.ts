import { getClient, getDefaultClient } from "@/core/client";
import { startKeepAlive, stopKeepAlive } from "@/core/keepAlive";
import getServer from "@/core/server";
import { logger } from "@/core/telemetry";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  logger.debug("Starting Tzafon MCP Server");

  // For stdio transport, we require the API key from environment variable
  const defaultClient = getDefaultClient();
  if (!defaultClient) {
    logger.error(
      "TZAFON_API_KEY environment variable is required for stdio transport"
    );
    console.error(
      "Error: TZAFON_API_KEY environment variable is required for stdio transport"
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  const server = await getServer(); // Uses environment variable
  await server.connect(transport);
  logger.info("Tzafon MCP Server running on stdio");

  // Start keep alive mechanism with the default client
  const client = getClient(); // Gets the client using env var
  await startKeepAlive(client);

  // Clean up on process exit
  process.on("SIGINT", () => {
    stopKeepAlive(client);
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    stopKeepAlive(client);
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
