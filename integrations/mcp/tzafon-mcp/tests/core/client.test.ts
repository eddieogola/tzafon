import { describe, expect, it, vi } from "vitest";

// Mock pino
vi.mock("pino", () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  })),
  destination: vi.fn(() => ({})),
}));

// Mock telemetry
vi.mock("@/core/telemetry", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("client", () => {
  describe("extractApiKey", () => {
    it("should extract API key from Bearer token", async () => {
      const { extractApiKey } = await import("@/core/client");
      const apiKey = extractApiKey("Bearer my-secret-key");
      expect(apiKey).toBe("my-secret-key");
    });

    it("should return raw token if no Bearer prefix", async () => {
      const { extractApiKey } = await import("@/core/client");
      const apiKey = extractApiKey("my-secret-key");
      expect(apiKey).toBe("my-secret-key");
    });

    it("should return undefined for empty header", async () => {
      const { extractApiKey } = await import("@/core/client");
      expect(extractApiKey(undefined)).toBeUndefined();
    });

    it("should return undefined for empty string", async () => {
      const { extractApiKey } = await import("@/core/client");
      expect(extractApiKey("")).toBeFalsy();
    });
  });

  describe("getClient", () => {
    it("should create a client with provided API key", async () => {
      const { getClient } = await import("@/core/client");
      const client = getClient("test-api-key");
      expect(client).toBeDefined();
      expect(client.computers).toBeDefined();
    });

    it("should cache clients by API key", async () => {
      const { getClient } = await import("@/core/client");
      const client1 = getClient("api-key-cache-1");
      const client2 = getClient("api-key-cache-1");
      expect(client1).toBe(client2);
    });

    it("should create different clients for different API keys", async () => {
      const { getClient } = await import("@/core/client");
      const client1 = getClient("api-key-diff-a");
      const client2 = getClient("api-key-diff-b");
      expect(client1).not.toBe(client2);
    });
  });

  describe("getDefaultClient", () => {
    it("should return a client when env var is set", async () => {
      // TZAFON_API_KEY is set in tests/setup.ts
      const { getDefaultClient } = await import("@/core/client");
      const client = getDefaultClient();
      expect(client).toBeDefined();
    });
  });

  describe("getActiveComputerId", () => {
    it("should return existing session ID if available", async () => {
      const { getClient, getActiveComputerId } = await import("@/core/client");
      const client = getClient("test-key-comp");
      const computerId = await getActiveComputerId(client);
      // The mock in setup.ts returns [{ id: "mock-computer-id" }]
      expect(computerId).toBe("mock-computer-id");
    });

    it("should create new session if none exist", async () => {
      const { getClient, getActiveComputerId } = await import("@/core/client");
      const client = getClient("new-key-session");
      // Mock the list to return empty
      client.computers.list = vi.fn().mockResolvedValue([]);
      const computerId = await getActiveComputerId(client);
      // The mock create returns { id: "new-computer-id" }
      expect(computerId).toBe("new-computer-id");
    });
  });
});
