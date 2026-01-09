import pino from "pino";

// Use stderr for logging to avoid interfering with MCP stdio communication
export const logger = pino(
  {
    name: "tzafon-mcp",
    level: "debug",
  },
  pino.destination(2) // 2 = stderr file descriptor
);
