import { logger } from "@/core/telemetry";
import { mcpDeleteHandler } from "@/handlers/delete";
import { mcpGetHandler } from "@/handlers/get";
import { mcpPostHandler, transports } from "@/handlers/post";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import dotenv from "dotenv";

dotenv.config();

const MCP_PORT = 5540;

const app = createMcpExpressApp();

app.get("/mcp", mcpGetHandler);
app.post("/mcp", mcpPostHandler);
app.delete("/mcp", mcpDeleteHandler);

app.listen(MCP_PORT, (error) => {
  if (error) {
    logger.error(`Error starting MCP server: ${error}`);
    process.exit(1);
  }
  logger.info(`MCP server running on port ${MCP_PORT}`);
});

process.on("SIGINT", async () => {
  logger.info("Shutting down server...");

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
