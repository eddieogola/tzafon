import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies
const mockGetServer = vi.fn();
const mockTransports: Record<string, any> = {};

vi.mock("@/core/server", () => ({
  default: () => mockGetServer(),
}));

vi.mock("@modelcontextprotocol/sdk/server/streamableHttp.js", () => ({
  StreamableHTTPServerTransport: vi.fn().mockImplementation((options) => {
    const transport = {
      sessionId: null,
      handleRequest: vi.fn(),
      onclose: null,
      connect: vi.fn(),
    };
    return transport;
  }),
}));

vi.mock("@modelcontextprotocol/sdk/types.js", () => ({
  isInitializeRequest: vi.fn(),
}));

vi.mock("@/core/telemetry", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("mcpPostHandler", () => {
  let mcpPostHandler: (req: any, res: any) => Promise<void>;
  let transports: Record<string, any>;
  let mockReq: any;
  let mockRes: any;
  let isInitializeRequest: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Setup mock server
    const mockServer = {
      connect: vi.fn(),
    };
    mockGetServer.mockResolvedValue(mockServer);

    // Create mock request/response
    mockReq = {
      headers: {},
      body: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      json: vi.fn(),
      headersSent: false,
    };

    const handlerModule = await import("@/handlers/post");
    mcpPostHandler = handlerModule.mcpPostHandler;
    transports = handlerModule.transports;

    const typesModule = await import("@modelcontextprotocol/sdk/types.js");
    isInitializeRequest = typesModule.isInitializeRequest;

    // Clear transports
    Object.keys(transports).forEach((key) => delete transports[key]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when no session ID and not initialize request", async () => {
    mockReq.headers["mcp-session-id"] = undefined;
    isInitializeRequest.mockReturnValue(false);

    await mcpPostHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonrpc: "2.0",
        error: expect.objectContaining({
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        }),
      })
    );
  });

  it("should use existing transport for valid session", async () => {
    const sessionId = "existing-session-123";
    const mockTransport = {
      handleRequest: vi.fn(),
    };

    mockReq.headers["mcp-session-id"] = sessionId;
    transports[sessionId] = mockTransport;

    await mcpPostHandler(mockReq, mockRes);

    expect(mockTransport.handleRequest).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      mockReq.body
    );
  });

  it("should handle internal server errors", async () => {
    const sessionId = "error-session";
    const mockTransport = {
      handleRequest: vi.fn().mockRejectedValue(new Error("Internal error")),
    };

    mockReq.headers["mcp-session-id"] = sessionId;
    transports[sessionId] = mockTransport;

    await mcpPostHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonrpc: "2.0",
        error: expect.objectContaining({
          code: -32000,
          message: "Internal Server Error",
        }),
      })
    );
  });
});
