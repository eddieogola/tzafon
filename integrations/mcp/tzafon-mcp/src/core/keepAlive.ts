import { getActiveComputerId } from "@/core/client";
import { logger } from "@/core/telemetry";
import type Computer from "tzafon";

const KEEP_ALIVE_INTERVAL_MS = 20000; // 20 seconds
const IDLE_TIMEOUT_MS = 60000; // 1 minute

// Store keep-alive state per client (keyed by a unique identifier)
const keepAliveState: Map<
  string,
  {
    interval: NodeJS.Timeout | null;
    lastActivityTimestamp: number;
    isActive: boolean;
    client: Computer;
  }
> = new Map();

/**
 * Get a unique key for a client instance
 */
function getClientKey(client: Computer): string {
  // Use the client's base URL or a hash of its configuration
  return (client as any)._options?.baseURL || "default";
}

/**
 * Record activity when a tool is called.
 * This resets the idle timer and restarts keepAlive if it was stopped.
 */
export async function recordActivity(client?: Computer) {
  if (!client) {
    logger.debug("No client provided to recordActivity, skipping");
    return;
  }

  const key = getClientKey(client);
  const state = keepAliveState.get(key);

  if (state) {
    state.lastActivityTimestamp = Date.now();
    logger.debug("Activity recorded");

    // Restart keepAlive if it was stopped due to inactivity
    if (!state.isActive) {
      logger.info("Restarting keep alive after activity");
      await startKeepAlive(client);
    }
  } else {
    // First activity for this client, start keep-alive
    await startKeepAlive(client);
  }
}

/**
 * Check if the session has been idle for too long.
 */
function isIdle(key: string): boolean {
  const state = keepAliveState.get(key);
  if (!state) return true;
  return Date.now() - state.lastActivityTimestamp > IDLE_TIMEOUT_MS;
}

export async function startKeepAlive(client: Computer) {
  const key = getClientKey(client);
  const existingState = keepAliveState.get(key);

  if (existingState?.isActive) {
    logger.debug("Keep alive already active for this client");
    return;
  }

  const computerId = await getActiveComputerId(client);

  const state = {
    interval: null as NodeJS.Timeout | null,
    lastActivityTimestamp: Date.now(),
    isActive: true,
    client,
  };

  keepAliveState.set(key, state);

  // Initial keep alive call
  try {
    await client.computers.keepAlive(computerId);
    logger.debug("Keep alive signal sent");
  } catch (error) {
    logger.error({ err: error }, "Failed to send keep alive signal");
  }

  // Set up periodic keep alive
  state.interval = setInterval(async () => {
    // Check if idle for too long
    if (isIdle(key)) {
      logger.info("No tool activity for 1 minute, stopping keep alive");
      stopKeepAlive(client);
      return;
    }

    try {
      const currentComputerId = await getActiveComputerId(client);
      await client.computers.keepAlive(currentComputerId);
      logger.debug("Keep alive signal sent");
    } catch (error) {
      logger.error({ err: error }, "Failed to send keep alive signal");
    }
  }, KEEP_ALIVE_INTERVAL_MS);
}

export function stopKeepAlive(client?: Computer) {
  if (!client) {
    // Stop all keep-alives if no client specified
    for (const [key, state] of keepAliveState) {
      if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
        state.isActive = false;
        logger.debug(`Keep alive stopped for ${key}`);
      }
    }
    keepAliveState.clear();
    return;
  }

  const key = getClientKey(client);
  const state = keepAliveState.get(key);

  if (state?.interval) {
    clearInterval(state.interval);
    state.interval = null;
    state.isActive = false;
    logger.debug("Keep alive stopped");
  }
}
