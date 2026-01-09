import client, { getActiveComputerId } from "@/core/client";
import { logger } from "@/core/telemetry";

const KEEP_ALIVE_INTERVAL_MS = 20000; // 20 seconds
const IDLE_TIMEOUT_MS = 60000; // 1 minute

let keepAliveInterval: NodeJS.Timeout | null = null;
let lastActivityTimestamp: number = Date.now();
let isKeepAliveActive: boolean = false;

/**
 * Record activity when a tool is called.
 * This resets the idle timer and restarts keepAlive if it was stopped.
 */
export async function recordActivity() {
  lastActivityTimestamp = Date.now();
  logger.debug("Activity recorded");

  // Restart keepAlive if it was stopped due to inactivity
  if (!isKeepAliveActive) {
    logger.info("Restarting keep alive after activity");
    await startKeepAlive();
  }
}

/**
 * Check if the session has been idle for too long.
 */
function isIdle(): boolean {
  return Date.now() - lastActivityTimestamp > IDLE_TIMEOUT_MS;
}

export async function startKeepAlive() {
  if (isKeepAliveActive) {
    logger.debug("Keep alive already active");
    return;
  }

  const computerId = await getActiveComputerId();
  isKeepAliveActive = true;
  lastActivityTimestamp = Date.now();

  // Initial keep alive call
  try {
    await client.computers.keepAlive(computerId);
    logger.debug("Keep alive signal sent");
  } catch (error) {
    logger.error({ err: error }, "Failed to send keep alive signal");
  }

  // Set up periodic keep alive
  keepAliveInterval = setInterval(async () => {
    // Check if idle for too long
    if (isIdle()) {
      logger.info("No tool activity for 1 minute, stopping keep alive");
      stopKeepAlive();
      return;
    }

    try {
      const currentComputerId = await getActiveComputerId();
      await client.computers.keepAlive(currentComputerId);
      logger.debug("Keep alive signal sent");
    } catch (error) {
      logger.error({ err: error }, "Failed to send keep alive signal");
    }
  }, KEEP_ALIVE_INTERVAL_MS);
}

export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    isKeepAliveActive = false;
    logger.debug("Keep alive stopped");
  }
}
