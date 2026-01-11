import { logger } from "@/core/telemetry";
import { config } from "dotenv";
import Computer from "tzafon";

config();

// Cache for clients with different API keys
const clientCache: Map<string, Computer> = new Map();

// Lazy-loaded default client (only created if TZAFON_API_KEY is set)
let defaultClient: Computer | null = null;

/**
 * Get the default client using environment variable.
 * Returns null if TZAFON_API_KEY is not set.
 */
export const getDefaultClient = (): Computer | null => {
  if (defaultClient) {
    return defaultClient;
  }

  const apiKey = process.env.TZAFON_API_KEY;
  if (!apiKey) {
    return null;
  }

  defaultClient = new Computer({ apiKey });
  return defaultClient;
};

/**
 * Get or create a Tzafon client for the given API key.
 * Uses caching to avoid creating multiple clients for the same key.
 * @param apiKey - Required API key for the Tzafon client
 * @throws Error if no API key is provided and no environment variable is set
 */
export const getClient = (apiKey?: string): Computer => {
  // If API key is provided, use it
  if (apiKey) {
    // Check cache first
    if (clientCache.has(apiKey)) {
      return clientCache.get(apiKey)!;
    }

    // Create new client and cache it
    const client = new Computer({ apiKey });
    clientCache.set(apiKey, client);
    return client;
  }

  // Fall back to default client (using environment variable)
  const fallbackClient = getDefaultClient();
  if (fallbackClient) {
    return fallbackClient;
  }

  throw new Error(
    "No API key provided. Please provide an API key via the Authorization header or set TZAFON_API_KEY environment variable."
  );
};

/**
 * Extract API key from Authorization header.
 * Supports "Bearer <token>" format.
 */
export const extractApiKey = (authHeader?: string): string | undefined => {
  if (!authHeader) {
    return undefined;
  }

  // Support "Bearer <token>" format
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Support raw token format
  return authHeader;
};

/**
 * Get the active computer ID for the given client.
 * Creates a new session if none exists.
 */
export const getActiveComputerId = async (
  client: Computer
): Promise<string> => {
  try {
    const sessions = await client.computers.list();
    if (Boolean(sessions.length)) {
      const activeSession = sessions[0];
      return activeSession.id || "";
    } else {
      const session = await client.create({ kind: "browser" });
      return session.id;
    }
  } catch (error: any) {
    logger.error(error);
    throw new Error(error);
  }
};

// Export getDefaultClient as default for backward compatibility (stdio transport)
export default { getDefaultClient, getClient };
