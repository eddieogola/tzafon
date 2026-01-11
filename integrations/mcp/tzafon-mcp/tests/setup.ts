import { afterEach, beforeEach, vi } from "vitest";

// Global pino mock - must be defined before any imports that use pino
vi.mock("pino", () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn(() => mockLogger),
  };
  return {
    default: vi.fn(() => mockLogger),
    destination: vi.fn(() => ({})),
    pino: vi.fn(() => mockLogger),
  };
});

// Mock dotenv globally
vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

// Mock tzafon client globally
vi.mock("tzafon", () => ({
  default: class MockComputer {
    computers = {
      list: vi.fn().mockResolvedValue([{ id: "mock-computer-id" }]),
      keepAlive: vi.fn().mockResolvedValue({}),
      navigate: vi.fn().mockResolvedValue({}),
      captureScreenshot: vi.fn().mockResolvedValue({
        result: { screenshot_url: "https://example.com/screenshot.png" },
        page_context: { viewport_width: 1920, viewport_height: 1080 },
      }),
      scrollViewport: vi.fn().mockResolvedValue({}),
      typeText: vi.fn().mockResolvedValue({}),
      pressHotkey: vi.fn().mockResolvedValue({}),
      click: vi.fn().mockResolvedValue({}),
      getHTML: vi.fn().mockResolvedValue({
        result: { html_content: "<html></html>" },
      }),
      executeAction: vi.fn().mockResolvedValue({}),
      rightClick: vi.fn().mockResolvedValue({}),
      doubleClick: vi.fn().mockResolvedValue({}),
      drag: vi.fn().mockResolvedValue({}),
    };
    create = vi.fn().mockResolvedValue({ id: "new-computer-id" });
  },
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Mock environment variables
process.env.TZAFON_API_KEY = "test-api-key";
process.env.MCP_PORT = "3000";
