import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock client module
const mockKeepAlive = vi.fn();
const mockGetActiveComputerId = vi.fn().mockResolvedValue("test-computer-id");

vi.mock("@/core/client", () => ({
  default: {
    computers: {
      keepAlive: mockKeepAlive,
    },
  },
  getActiveComputerId: () => mockGetActiveComputerId(),
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
  let recordActivity: () => Promise<void>;
  let startKeepAlive: () => Promise<void>;
  let stopKeepAlive: () => void;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Reset mocks
    mockKeepAlive.mockResolvedValue({});
    mockGetActiveComputerId.mockResolvedValue("test-computer-id");

    // Import fresh module
    const keepAliveModule = await import("@/core/keepAlive");
    recordActivity = keepAliveModule.recordActivity;
    startKeepAlive = keepAliveModule.startKeepAlive;
    stopKeepAlive = keepAliveModule.stopKeepAlive;
  });

  afterEach(() => {
    stopKeepAlive();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("startKeepAlive", () => {
    it("should send initial keep alive signal", async () => {
      await startKeepAlive();

      expect(mockKeepAlive).toHaveBeenCalledWith("test-computer-id");
      expect(mockKeepAlive).toHaveBeenCalledTimes(1);
    });

    it("should set up periodic keep alive interval", async () => {
      await startKeepAlive();

      // Initial call
      expect(mockKeepAlive).toHaveBeenCalledTimes(1);

      // Advance time by 20 seconds (KEEP_ALIVE_INTERVAL_MS)
      await vi.advanceTimersByTimeAsync(20000);

      // Should have called keep alive again
      expect(mockKeepAlive).toHaveBeenCalledTimes(2);
    });

    it("should not start again if already active", async () => {
      await startKeepAlive();
      await startKeepAlive();

      // Should only have one initial call
      expect(mockKeepAlive).toHaveBeenCalledTimes(1);
    });

    it("should handle keep alive API errors gracefully", async () => {
      mockKeepAlive.mockRejectedValue(new Error("API error"));

      // Should not throw
      await expect(startKeepAlive()).resolves.not.toThrow();
    });
  });

  describe("stopKeepAlive", () => {
    it("should clear the interval when called", async () => {
      await startKeepAlive();

      expect(mockKeepAlive).toHaveBeenCalledTimes(1);

      stopKeepAlive();

      // Advance time - no more calls should happen
      await vi.advanceTimersByTimeAsync(60000);

      expect(mockKeepAlive).toHaveBeenCalledTimes(1);
    });

    it("should handle being called when not active", () => {
      // Should not throw when called without startKeepAlive
      expect(() => stopKeepAlive()).not.toThrow();
    });

    it("should handle being called multiple times", async () => {
      await startKeepAlive();

      stopKeepAlive();
      stopKeepAlive();
      stopKeepAlive();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe("recordActivity", () => {
    it("should update last activity timestamp", async () => {
      await startKeepAlive();

      // Fast forward to near idle timeout
      await vi.advanceTimersByTimeAsync(50000);

      // Record activity to reset the timer
      await recordActivity();

      // Advance past what would have been idle timeout
      await vi.advanceTimersByTimeAsync(30000);

      // Keep alive should still be running (not stopped due to idle)
      expect(mockKeepAlive.mock.calls.length).toBeGreaterThan(1);
    });

    it("should restart keep alive if it was stopped", async () => {
      await startKeepAlive();
      stopKeepAlive();

      // Clear the call count
      mockKeepAlive.mockClear();

      // Record activity should restart keep alive
      await recordActivity();

      // Should have restarted and called keep alive
      expect(mockKeepAlive).toHaveBeenCalled();
    });
  });

  describe("idle detection", () => {
    it("should stop keep alive after idle timeout", async () => {
      await startKeepAlive();

      // Initial call
      expect(mockKeepAlive).toHaveBeenCalledTimes(1);

      // Advance past idle timeout (60 seconds) + one interval
      await vi.advanceTimersByTimeAsync(80000);

      // Get final call count
      const callCountAfterIdle = mockKeepAlive.mock.calls.length;

      // Advance more time
      await vi.advanceTimersByTimeAsync(60000);

      // Should not have made more calls after idle stop
      expect(mockKeepAlive.mock.calls.length).toBe(callCountAfterIdle);
    });
  });
});
