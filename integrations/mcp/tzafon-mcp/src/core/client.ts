import { logger } from "@/core/telemetry";
import { config } from "dotenv";
import Computer from "tzafon";

config();

export const VIEWPORT_WIDTH = 1920;
export const VIEWPORT_HEIGHT = 1080;

const client = new Computer({
  apiKey: process.env.TZAFON_API_KEY,
});

export const getActiveComputerId = async (): Promise<string> => {
  try {
    const sessions = await client.computers.list();
    if (Boolean(sessions.length)) {
      const activeSession = sessions[0];
      return activeSession.id || "";
    } else {
      const session = await client.create({ kind: "browser" });
      session.setViewport(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      return session.id;
    }
  } catch (error: any) {
    logger.error(error);
    throw new Error(error);
  }
};

export default client;
