import pino from "pino";

export const logger = pino({
  name: "tzafon-mcp",
  level: "debug",
});
