import { webAgent } from "@/agents";
import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

export const mastra = new Mastra({
  agents: { webAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
