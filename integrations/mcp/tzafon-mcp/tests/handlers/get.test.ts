import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the transports object
const mockTransports: Record<string, any> = {};

vi.mock("@/handlers/post", () => ({
  transports: mockTransports,
}));

describe("mcpGetHandler", () => {
  let mcpGetHandler: (req: any, res: any) => Promise<void>;
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
    };

    // Create mock request/response
    mockReq = {
      headers: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      json: vi.fn(),
    };

    const handlerModule = await import("@/handlers/get");
    mcpGetHandler = handlerModule.mcpGetHandler;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when session ID is missing", async () => {
    mockReq.headers["mcp-session-id"] = undefined;

    await mcpGetHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("Invalid or missing session ID");
  });

  it("should return 400 when session ID is invalid", async () => {
    mockReq.headers["mcp-session-id"] = "non-existent-session";

    await mcpGetHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("Invalid or missing session ID");
  });

  it("should handle request with valid session ID", async () => {
    const sessionId = "valid-session-123";
    mockReq.headers["mcp-session-id"] = sessionId;
    mockTransports[sessionId] = mockTransport;

    await mcpGetHandler(mockReq, mockRes);

    expect(mockTransport.handleRequest).toHaveBeenCalledWith(mockReq, mockRes);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("should pass request to transport handleRequest", async () => {
    const sessionId = "test-session";
    mockReq.headers["mcp-session-id"] = sessionId;
    mockTransports[sessionId] = mockTransport;

    await mcpGetHandler(mockReq, mockRes);

    expect(mockTransport.handleRequest).toHaveBeenCalledTimes(1);
    expect(mockTransport.handleRequest).toHaveBeenCalledWith(mockReq, mockRes);
  });
});
