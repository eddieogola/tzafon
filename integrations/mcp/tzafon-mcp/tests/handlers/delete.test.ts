import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the transports object
const mockTransports: Record<string, any> = {};

vi.mock("@/handlers/post", () => ({
  transports: mockTransports,
}));

vi.mock("@/core/telemetry", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("mcpDeleteHandler", () => {
  let mcpDeleteHandler: (req: any, res: any) => Promise<void>;
  let mockReq: any;
  let mockRes: any;
  let mockTransport: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Clear transports
    Object.keys(mockTransports).forEach((key) => delete mockTransports[key]);

    // Create mock transport
    mockTransport = {
      handleRequest: vi.fn(),
      close: vi.fn(),
    };

    // Create mock request/response
    mockReq = {
      headers: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      json: vi.fn(),
      headersSent: false,
    };

    const handlerModule = await import("@/handlers/delete");
    mcpDeleteHandler = handlerModule.mcpDeleteHandler;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when session ID is missing", async () => {
    mockReq.headers["mcp-session-id"] = undefined;

    await mcpDeleteHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("Invalid or missing session ID");
  });

  it("should return 400 when session ID is invalid", async () => {
    mockReq.headers["mcp-session-id"] = "non-existent-session";

    await mcpDeleteHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("Invalid or missing session ID");
  });

  it("should handle delete request with valid session ID", async () => {
    const sessionId = "valid-session-123";
    mockReq.headers["mcp-session-id"] = sessionId;
    mockTransports[sessionId] = mockTransport;

    await mcpDeleteHandler(mockReq, mockRes);

    expect(mockTransport.handleRequest).toHaveBeenCalledWith(mockReq, mockRes);
  });

  it("should handle errors during session termination", async () => {
    const sessionId = "error-session";
    mockReq.headers["mcp-session-id"] = sessionId;
    mockTransports[sessionId] = {
      handleRequest: vi.fn().mockRejectedValue(new Error("Termination error")),
    };

    await mcpDeleteHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith(
      "Error processing session termination"
    );
  });

  it("should not send error response if headers already sent", async () => {
    const sessionId = "error-session";
    mockReq.headers["mcp-session-id"] = sessionId;
    mockRes.headersSent = true;
    mockTransports[sessionId] = {
      handleRequest: vi.fn().mockRejectedValue(new Error("Termination error")),
    };

    await mcpDeleteHandler(mockReq, mockRes);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });
});
