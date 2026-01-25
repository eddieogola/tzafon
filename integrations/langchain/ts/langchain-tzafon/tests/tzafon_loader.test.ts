/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    jest,
    test,
} from "@jest/globals";
import Computer from "@tzafon/computer";
import { TzafonLoader } from "../src/tzafon_loader";

describe("TzafonLoader", () => {
  const originalEnv = process.env;
  let createSpy: any;

  beforeAll(() => {
    // Spy on the Computer.prototype.create method
    createSpy = jest
      .spyOn(Computer.prototype as any, "create")
      .mockResolvedValue({
        navigate: jest.fn(),
        getHTML: (jest.fn() as any).mockResolvedValue({
          result: {
            html_content: "<html><body>Mock Content</body></html>",
          },
        } as any),
        terminate: jest.fn(),
      } as any);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  afterAll(() => {
    createSpy.mockRestore();
  });

  test("throws error if no API key is provided", () => {
    delete process.env.TZAFON_API_KEY;
    // ensure process.env.TZAFON_API_KEY is actually undefined
    expect(() => new TzafonLoader(["https://example.com"])).toThrow(
      "Tzafon API key is required"
    );
  });

  test("initializes with API key in options", () => {
    expect(
      () =>
        new TzafonLoader(["https://example.com"], {
          apiKey: "test-key",
        })
    ).not.toThrow();
  });

  test("initializes with API key in environment", () => {
    process.env.TZAFON_API_KEY = "test-key";
    expect(() => new TzafonLoader(["https://example.com"])).not.toThrow();
  });

  test("loads documents correctly", async () => {
    const urls = ["https://example.com", "https://test.com"];
    const loader = new TzafonLoader(urls, { apiKey: "test-key" });

    // Ensure the spy returns the mock implementation each time
    createSpy.mockResolvedValue({
      navigate: jest.fn(),
      getHTML: (jest.fn() as any).mockResolvedValue({
        result: {
          html_content: "<html><body>Mock Content</body></html>",
        },
      }),
      terminate: jest.fn(),
    });

    const docs = await loader.load();

    expect(docs).toHaveLength(2);
    expect(docs[0].pageContent).toBe("<html><body>Mock Content</body></html>");
    expect(docs[0].metadata).toEqual({ url: "https://example.com" });
    expect(docs[1].metadata).toEqual({ url: "https://test.com" });

    expect(createSpy).toHaveBeenCalled();
  });

  test("handles single URL string", async () => {
    const loader = new TzafonLoader("https://single.com", {
      apiKey: "test-key",
    });

    createSpy.mockResolvedValue({
      navigate: jest.fn(),
      getHTML: (jest.fn() as any).mockResolvedValue({
        result: {
          html_content: "<html><body>Mock Content</body></html>",
        },
      }),
      terminate: jest.fn(),
    });

    const docs = await loader.load();
    expect(docs).toHaveLength(1);
    expect(docs[0].metadata).toEqual({ url: "https://single.com" });
  });
});
