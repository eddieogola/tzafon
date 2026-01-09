import { startKeepAlive, stopKeepAlive } from "@/core/keepAlive";
import { logger } from "@/core/telemetry";
import { mcpDeleteHandler } from "@/handlers/delete";
import { mcpGetHandler } from "@/handlers/get";
import { mcpPostHandler, transports } from "@/handlers/post";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";

const MCP_PORT = process.env.MCP_PORT || 3000;

const app = createMcpExpressApp();

app.get("/mcp", mcpGetHandler);
app.post("/mcp", mcpPostHandler);
app.delete("/mcp", mcpDeleteHandler);

app.listen(MCP_PORT, async (error) => {
  if (error) {
    logger.error(`Error starting MCP server: ${error}`);
    process.exit(1);
  }
  logger.info(`MCP server running on port ${MCP_PORT}`);

  // Start keep alive mechanism
  await startKeepAlive();
});

process.on("SIGINT", async () => {
  logger.info("Shutting down server...");

  // Stop keep alive
  stopKeepAlive();

  for (const sessionId in transports) {
    try {
      logger.info(`Closing transport for session ${sessionId}`);
      await transports[sessionId]!.close();
      delete transports[sessionId];
    } catch (error) {
      logger.error(
        `Error closing transport for session ${sessionId}: ${error}`
      );
    }
  }
  logger.info("Server shutdown complete");
  process.exit(0);
});
