import { logger } from "@/core/telemetry";
import { transports } from "@/handlers/post";
import type { Request, Response } from "express";

export const mcpDeleteHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }

  try {
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } catch (error) {
    logger.error(`Error handling MCP request: ${error}`);
    if (!res.headersSent) {
      res.status(500).send("Error processing session termination");
    }
  }
};
