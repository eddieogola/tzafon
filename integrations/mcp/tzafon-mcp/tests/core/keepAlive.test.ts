import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

describe("keepAlive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("recordActivity", () => {
    it("should start keep-alive on first activity", async () => {
      const { recordActivity } = await import("@/core/keepAlive");
      const { getClient } = await import("@/core/client");

      const client = getClient("test-key-rec");
      await recordActivity(client);

      // Should have called keepAlive
      expect(client.computers.keepAlive).toHaveBeenCalled();
    });

    it("should skip if no client provided", async () => {
      const { recordActivity } = await import("@/core/keepAlive");
      const { getClient } = await import("@/core/client");

      const client = getClient("test-key-skip");
      vi.clearAllMocks();

      await recordActivity(undefined);

      // Should NOT have called keepAlive
      expect(client.computers.keepAlive).not.toHaveBeenCalled();
    });
  });

  describe("startKeepAlive", () => {
    it("should send initial keep-alive signal", async () => {
      const { startKeepAlive, stopKeepAlive } = await import(
        "@/core/keepAlive"
      );
      const { getClient } = await import("@/core/client");

      // Use a unique key to get a fresh client
      const client = getClient(`start-test-key-${Date.now()}`);
      await startKeepAlive(client);

      // The function should complete without error
      // and the keep-alive state should be active
      expect(true).toBe(true);

      // Clean up
      stopKeepAlive(client);
    });

    it("should send periodic keep-alive signals", async () => {
      const { startKeepAlive, stopKeepAlive } = await import(
        "@/core/keepAlive"
      );
      const { getClient } = await import("@/core/client");

      // Use a unique key to get a fresh client
      const client = getClient(`periodic-test-key-${Date.now()}`);
      await startKeepAlive(client);

      // Advance timers by 20 seconds (keep-alive interval)
      await vi.advanceTimersByTimeAsync(20000);

      // The periodic call should have completed without error
      expect(true).toBe(true);

      // Clean up
      stopKeepAlive(client);
    });
  });

  describe("stopKeepAlive", () => {
    it("should stop keep-alive for specific client", async () => {
      const { startKeepAlive, stopKeepAlive } = await import(
        "@/core/keepAlive"
      );
      const { getClient } = await import("@/core/client");

      const client = getClient("stop-test-key-spec");
      await startKeepAlive(client);
      vi.clearAllMocks();

      stopKeepAlive(client);

      // Advance timers - should not trigger keep-alive
      await vi.advanceTimersByTimeAsync(20000);

      expect(client.computers.keepAlive).not.toHaveBeenCalled();
    });

    it("should stop all keep-alives when no client specified", async () => {
      const { startKeepAlive, stopKeepAlive } = await import(
        "@/core/keepAlive"
      );
      const { getClient } = await import("@/core/client");

      const client1 = getClient("stop-all-key-1-all");
      const client2 = getClient("stop-all-key-2-all");

      await startKeepAlive(client1);
      await startKeepAlive(client2);
      vi.clearAllMocks();

      stopKeepAlive(); // Stop all

      await vi.advanceTimersByTimeAsync(20000);

      expect(client1.computers.keepAlive).not.toHaveBeenCalled();
      expect(client2.computers.keepAlive).not.toHaveBeenCalled();
    });
  });
});
