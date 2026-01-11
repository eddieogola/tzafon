import { LlmAgent, MCPToolset } from '@google/adk';
import * as dotenv from 'dotenv';

dotenv.config();

const TZAFON_API_KEY = process.env.TZAFON_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Tzafon Agent implemented using Google ADK.
 * This agent uses the Tzafon MCP server to interact with web pages.
 */
export const rootAgent = new LlmAgent({
  name: 'tzafon_agent',
  model: 'gemini-2.5-pro',
  description: 'Help users get information from web pages using Tzafon',
  instruction: 'Help users get information from web pages using Tzafon',
  tools: [
    new MCPToolset({
      type: "StdioConnectionParams",
      serverParams: {
        command: "node",
        args: [
          "Tzafon MCP Path Here",
          "--proxies",
        ],
        env: {
          TZAFON_API_KEY: TZAFON_API_KEY || '',
          GEMINI_API_KEY: GEMINI_API_KEY || '',
        },
      },
    }),
  ],
});
