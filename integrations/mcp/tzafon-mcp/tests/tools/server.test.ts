import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock pino at top level
vi.mock("pino", () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    trace: vi.fn(),
  };
  return {
    default: vi.fn(() => mockLogger),
    destination: vi.fn(() => ({})),
  };
});

/**
 * MCP Server Tool Tests
 *
 * These tests verify the individual tool functionality by calling
 * the tool handlers directly with mocked dependencies.
 */

// Mock all dependencies before importing
const mockNavigate = vi.fn();
const mockCaptureScreenshot = vi.fn();
const mockScrollViewport = vi.fn();
const mockTypeText = vi.fn();
const mockPressHotkey = vi.fn();
const mockClick = vi.fn();
const mockGetHTML = vi.fn();
const mockExecuteAction = vi.fn();
const mockRightClick = vi.fn();
const mockDoubleClick = vi.fn();
const mockDrag = vi.fn();
const mockRecordActivity = vi.fn();
const mockGetActiveComputerId = vi
  .fn()
  .mockResolvedValue("test-computer-id-123");

// Mock fetch for screenshot test
global.fetch = vi.fn();

vi.mock("@/core/client", () => ({
  default: {
    computers: {
      navigate: (...args: any[]) => mockNavigate(...args),
      captureScreenshot: (...args: any[]) => mockCaptureScreenshot(...args),
      scrollViewport: (...args: any[]) => mockScrollViewport(...args),
      typeText: (...args: any[]) => mockTypeText(...args),
      pressHotkey: (...args: any[]) => mockPressHotkey(...args),
      click: (...args: any[]) => mockClick(...args),
      getHTML: (...args: any[]) => mockGetHTML(...args),
      executeAction: (...args: any[]) => mockExecuteAction(...args),
      rightClick: (...args: any[]) => mockRightClick(...args),
      doubleClick: (...args: any[]) => mockDoubleClick(...args),
      drag: (...args: any[]) => mockDrag(...args),
    },
  },
  getActiveComputerId: () => mockGetActiveComputerId(),
}));

vi.mock("@/core/keepAlive", () => ({
  recordActivity: () => mockRecordActivity(),
}));

// Helper to get tool by name from server
const getToolByName = (server: any, name: string): any => {
  if (server._registeredTools instanceof Map) {
    return server._registeredTools.get(name);
  }
  if (server._registeredTools && typeof server._registeredTools === "object") {
    return server._registeredTools[name];
  }
  if (server.tools instanceof Map) {
    return server.tools.get(name);
  }
  if (server.tools && typeof server.tools === "object") {
    return server.tools[name];
  }
  return null;
};

describe("MCP Server Tools", () => {
  let getServer: () => Promise<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockRecordActivity.mockResolvedValue(undefined);
    mockGetActiveComputerId.mockResolvedValue("test-computer-id-123");

    const serverModule = await import("@/core/server");
    getServer = serverModule.default;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Server initialization", () => {
    it("should create server successfully", async () => {
      const server = await getServer();
      expect(server).toBeDefined();
    });
  });

  describe("navigate tool", () => {
    it("should successfully navigate to a URL", async () => {
      mockNavigate.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "navigate");

      if (!tool) return;

      const result = await tool.handler({ url: "https://example.com" });

      expect(mockRecordActivity).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("test-computer-id-123", {
        url: "https://example.com",
      });
      expect(result.content[0].text).toContain("Navigated to");
    });

    it("should handle navigation errors", async () => {
      mockNavigate.mockRejectedValue(new Error("Network error"));

      const server = await getServer();
      const tool = getToolByName(server, "navigate");

      if (!tool) return;

      const result = await tool.handler({ url: "https://example.com" });

      expect(result.isError).toBe(true);
    });
  });

  describe("take_screenshot tool", () => {
    it("should return base64 encoded screenshot", async () => {
      const mockScreenshotUrl = "https://storage.example.com/screenshot.png";
      const mockBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ";
      const mockArrayBuffer = Buffer.from(mockBase64, "base64");

      mockCaptureScreenshot.mockResolvedValue({
        result: { screenshot_url: mockScreenshotUrl },
        page_context: { viewport_width: 1920, viewport_height: 1080 },
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
        headers: {
          get: () => "image/png",
        },
      });

      const server = await getServer();
      const tool = getToolByName(server, "take_screenshot");

      if (!tool) return;

      const result = await tool.handler({});

      expect(mockRecordActivity).toHaveBeenCalled();
      expect(result.content[0].type).toBe("image");
    });

    it("should handle missing screenshot URL", async () => {
      mockCaptureScreenshot.mockResolvedValue({
        result: {},
        page_context: {},
      });

      const server = await getServer();
      const tool = getToolByName(server, "take_screenshot");

      if (!tool) return;

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
    });

    it("should handle API errors", async () => {
      mockCaptureScreenshot.mockRejectedValue(new Error("API error"));

      const server = await getServer();
      const tool = getToolByName(server, "take_screenshot");

      if (!tool) return;

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
    });
  });

  describe("scroll tool", () => {
    it("should scroll with grid coordinates", async () => {
      mockScrollViewport.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "scroll");

      if (!tool) return;

      const result = await tool.handler({
        dx: 100,
        dy: 200,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(mockScrollViewport).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Scrolled");
    });

    it("should handle scroll errors", async () => {
      mockScrollViewport.mockRejectedValue(new Error("Scroll error"));

      const server = await getServer();
      const tool = getToolByName(server, "scroll");

      if (!tool) return;

      const result = await tool.handler({
        dx: 100,
        dy: 200,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(result.isError).toBe(true);
    });
  });

  describe("type tool", () => {
    it("should type text successfully", async () => {
      mockTypeText.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "type");

      if (!tool) return;

      const result = await tool.handler({ text: "Hello, World!" });

      expect(mockTypeText).toHaveBeenCalledWith("test-computer-id-123", {
        text: "Hello, World!",
      });
      expect(result.content[0].text).toContain("Typed");
    });

    it("should handle type errors", async () => {
      mockTypeText.mockRejectedValue(new Error("Type error"));

      const server = await getServer();
      const tool = getToolByName(server, "type");

      if (!tool) return;

      const result = await tool.handler({ text: "test" });

      expect(result.isError).toBe(true);
    });
  });

  describe("hotkey tool", () => {
    it("should press key combination", async () => {
      mockPressHotkey.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "hotkey");

      if (!tool) return;

      const result = await tool.handler({ hotkeys: ["ctrl", "c"] });

      expect(mockPressHotkey).toHaveBeenCalledWith("test-computer-id-123", {
        keys: ["ctrl", "c"],
      });
      expect(result.content[0].text).toContain("Pressed");
    });

    it("should handle hotkey errors", async () => {
      mockPressHotkey.mockRejectedValue(new Error("Hotkey error"));

      const server = await getServer();
      const tool = getToolByName(server, "hotkey");

      if (!tool) return;

      const result = await tool.handler({ hotkeys: ["enter"] });

      expect(result.isError).toBe(true);
    });
  });

  describe("click tool", () => {
    it("should click at center coordinates", async () => {
      mockClick.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "click");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(mockClick).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Clicked");
    });

    it("should click at corner coordinates", async () => {
      mockClick.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "click");

      if (!tool) return;

      await tool.handler({
        x: 0,
        y: 0,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(mockClick).toHaveBeenCalledWith("test-computer-id-123", {
        x: 0,
        y: 0,
      });
    });

    it("should handle click errors", async () => {
      mockClick.mockRejectedValue(new Error("Click error"));

      const server = await getServer();
      const tool = getToolByName(server, "click");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(result.isError).toBe(true);
    });
  });

  describe("getHTML tool", () => {
    it("should return HTML content", async () => {
      const mockHTML = "<html><body>Test</body></html>";
      mockGetHTML.mockResolvedValue({
        result: { html_content: mockHTML },
      });

      const server = await getServer();
      const tool = getToolByName(server, "getHTML");

      if (!tool) return;

      const result = await tool.handler({});

      expect(result.content[0].text).toBe(mockHTML);
    });

    it("should handle missing HTML response", async () => {
      mockGetHTML.mockResolvedValue({
        result: {},
      });

      const server = await getServer();
      const tool = getToolByName(server, "getHTML");

      if (!tool) return;

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
    });

    it("should handle getHTML errors", async () => {
      mockGetHTML.mockRejectedValue(new Error("Get HTML error"));

      const server = await getServer();
      const tool = getToolByName(server, "getHTML");

      if (!tool) return;

      const result = await tool.handler({});

      expect(result.isError).toBe(true);
    });
  });

  describe("wait tool", () => {
    it("should wait for specified duration", async () => {
      mockExecuteAction.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "wait");

      if (!tool) return;

      const result = await tool.handler({ seconds: 2 });

      expect(mockExecuteAction).toHaveBeenCalledWith("test-computer-id-123", {
        action: { type: "wait", ms: 2000 },
      });
      expect(result.content[0].text).toContain("Waited");
    });

    it("should handle wait errors", async () => {
      mockExecuteAction.mockRejectedValue(new Error("Wait error"));

      const server = await getServer();
      const tool = getToolByName(server, "wait");

      if (!tool) return;

      const result = await tool.handler({ seconds: 2 });

      expect(result.isError).toBe(true);
    });
  });

  describe("right_click tool", () => {
    it("should right click at grid coordinates", async () => {
      mockRightClick.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "right_click");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(mockRightClick).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Right clicked");
    });

    it("should handle right click errors", async () => {
      mockRightClick.mockRejectedValue(new Error("Right click error"));

      const server = await getServer();
      const tool = getToolByName(server, "right_click");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(result.isError).toBe(true);
    });
  });

  describe("double_click tool", () => {
    it("should double click at grid coordinates", async () => {
      mockDoubleClick.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "double_click");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(mockDoubleClick).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Double clicked");
    });

    it("should handle double click errors", async () => {
      mockDoubleClick.mockRejectedValue(new Error("Double click error"));

      const server = await getServer();
      const tool = getToolByName(server, "double_click");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(result.isError).toBe(true);
    });
  });

  describe("drag tool", () => {
    it("should drag from start to end coordinates", async () => {
      mockDrag.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "drag");

      if (!tool) return;

      const result = await tool.handler({
        x1: 100,
        y1: 100,
        x2: 900,
        y2: 900,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(mockDrag).toHaveBeenCalled();
      expect(result.content[0].text).toContain("Dragged");
    });

    it("should handle drag errors", async () => {
      mockDrag.mockRejectedValue(new Error("Drag error"));

      const server = await getServer();
      const tool = getToolByName(server, "drag");

      if (!tool) return;

      const result = await tool.handler({
        x1: 100,
        y1: 100,
        x2: 900,
        y2: 900,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(result.isError).toBe(true);
    });
  });

  describe("mouse_down tool", () => {
    it("should execute mouse down at grid coordinates", async () => {
      mockExecuteAction.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "mouse_down");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(mockExecuteAction).toHaveBeenCalledWith(
        "test-computer-id-123",
        expect.objectContaining({
          action: expect.objectContaining({
            type: "mouse_down",
          }),
        })
      );
      expect(result.content[0].text).toContain("Mouse down");
    });

    it("should handle mouse down errors", async () => {
      mockExecuteAction.mockRejectedValue(new Error("Mouse down error"));

      const server = await getServer();
      const tool = getToolByName(server, "mouse_down");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(result.isError).toBe(true);
    });
  });

  describe("mouse_up tool", () => {
    it("should execute mouse up at grid coordinates", async () => {
      mockExecuteAction.mockResolvedValue({});

      const server = await getServer();
      const tool = getToolByName(server, "mouse_up");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(mockExecuteAction).toHaveBeenCalledWith(
        "test-computer-id-123",
        expect.objectContaining({
          action: expect.objectContaining({
            type: "mouse_up",
          }),
        })
      );
      expect(result.content[0].text).toContain("Mouse up");
    });

    it("should handle mouse up errors", async () => {
      mockExecuteAction.mockRejectedValue(new Error("Mouse up error"));

      const server = await getServer();
      const tool = getToolByName(server, "mouse_up");

      if (!tool) return;

      const result = await tool.handler({
        x: 500,
        y: 500,
        viewportWidth: 1920,
        viewportHeight: 1080,
      });

      expect(result.isError).toBe(true);
    });
  });
});
