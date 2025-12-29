import getServer from "@/core/server";
import { logger } from "@/core/telemetry";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

export const transports: {
  [sessionId: string]: StreamableHTTPServerTransport;
} = {};

export const mcpPostHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId) {
    logger.info(`Received MCP request for session: ${sessionId}`);
  } else {
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
  }

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId: string) => {
          logger.info(`Session initialized with ID: ${sessionId}`);
          transports[sessionId] = transport;
        },
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          logger.info(
            `Transport closed for session ${sid}, removing from transports map`
          );
          delete transports[sid];
        }
      };

      const server = getServer();
      await server.connect(transport);

      await transport.handleRequest(req, res, req.body);

      return;
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    logger.error(`Error handling MCP request: ${error}`);
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Internal Server Error",
      },
      id: null,
    });
  }
};
