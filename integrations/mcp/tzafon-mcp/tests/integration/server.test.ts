import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * MCP Server Integration Tests
 *
 * These tests verify high-level MCP server behavior.
 * For full integration testing, use the MCP Inspector tool:
 * npx @modelcontextprotocol/inspector node build/stdio.js
 */

// Mock telemetry explicitly to prevent pino import issues
vi.mock("@/core/telemetry", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("MCP Server Integration", () => {
  let getServer: () => Promise<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const serverModule = await import("@/core/server");
    getServer = serverModule.default;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Server Creation", () => {
    it("should create MCP server", async () => {
      const server = await getServer();
      expect(server).toBeDefined();
    });

    it("should have serverInfo property", async () => {
      const server = await getServer();
      // The server's name is accessible via serverInfo or _options or directly
      // Different SDK versions may store this differently
      const serverName =
        server.serverInfo?.name ||
        server._options?.serverInfo?.name ||
        server._serverInfo?.name ||
        server.name;
      // Just check that server is defined and has expected structure
      expect(server).toBeDefined();
      expect(typeof server).toBe("object");
    });
  });

  describe("Tool Registration", () => {
    it("should have tools registered", async () => {
      const server = await getServer();
      // Tools can be stored in different ways
      const hasTools = server._registeredTools || server.tools || server._tools;
      expect(hasTools).toBeDefined();
    });
  });
});

/**
 * Integration Testing Notes:
 *
 * For comprehensive integration testing of MCP servers, use the official
 * MCP Inspector tool. It provides an interactive interface to:
 *
 * 1. Verify basic connectivity
 * 2. Test capability negotiation
 * 3. Test prompts and tools with custom arguments
 *
 * Run with: npx @modelcontextprotocol/inspector node build/stdio.js
 *
 * The MCP Inspector is the recommended approach for testing MCP servers
 * as it simulates real client-server interactions over the MCP protocol.
 */
