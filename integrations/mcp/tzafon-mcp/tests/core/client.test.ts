import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the tzafon module
vi.mock("tzafon", () => {
  return {
    default: class MockComputer {
      computers = {
        list: vi.fn(),
      };
      create = vi.fn();
    },
  };
});

// Mock the telemetry module
vi.mock("@/core/telemetry", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock dotenv
vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

describe("client", () => {
  let mockClient: any;
  let getActiveComputerId: () => Promise<string>;

  beforeEach(async () => {
    vi.resetModules();

    // Import fresh modules with mocks applied
    const clientModule = await import("@/core/client");
    mockClient = clientModule.default;
    getActiveComputerId = clientModule.getActiveComputerId;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveComputerId", () => {
    it("should return existing computer ID when sessions exist", async () => {
      const mockSessionId = "existing-session-123";
      mockClient.computers.list.mockResolvedValue([{ id: mockSessionId }]);

      const result = await getActiveComputerId();

      expect(result).toBe(mockSessionId);
      expect(mockClient.computers.list).toHaveBeenCalledTimes(1);
      expect(mockClient.create).not.toHaveBeenCalled();
    });

    it("should return first session ID when multiple sessions exist", async () => {
      const mockSessions = [
        { id: "session-1" },
        { id: "session-2" },
        { id: "session-3" },
      ];
      mockClient.computers.list.mockResolvedValue(mockSessions);

      const result = await getActiveComputerId();

      expect(result).toBe("session-1");
    });

    it("should create new session when no sessions exist", async () => {
      const newSessionId = "new-session-456";
      mockClient.computers.list.mockResolvedValue([]);
      mockClient.create.mockResolvedValue({ id: newSessionId });

      const result = await getActiveComputerId();

      expect(result).toBe(newSessionId);
      expect(mockClient.computers.list).toHaveBeenCalledTimes(1);
      expect(mockClient.create).toHaveBeenCalledWith({ kind: "browser" });
    });

    it("should return empty string when session has no ID", async () => {
      mockClient.computers.list.mockResolvedValue([{}]);

      const result = await getActiveComputerId();

      expect(result).toBe("");
    });

    it("should throw error when list API fails", async () => {
      const apiError = new Error("API connection failed");
      mockClient.computers.list.mockRejectedValue(apiError);

      await expect(getActiveComputerId()).rejects.toThrow();
    });

    it("should throw error when create API fails", async () => {
      mockClient.computers.list.mockResolvedValue([]);
      mockClient.create.mockRejectedValue(new Error("Create failed"));

      await expect(getActiveComputerId()).rejects.toThrow();
    });
  });
});
