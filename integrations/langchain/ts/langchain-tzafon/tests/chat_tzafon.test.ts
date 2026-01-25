/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    jest,
    test,
} from "@jest/globals";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatTzafon } from "../src/chat_tzafon";

// Mock OpenAI module
jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

// Import after mock
import OpenAI from "openai";

describe("ChatTzafon", () => {
  const originalEnv = process.env;
  let mockOpenAI: any;
  let mockCreate: any;

  beforeEach(() => {
    process.env = { ...originalEnv, TZAFON_API_KEY: "test-api-key" };
    jest.clearAllMocks();
    
    mockCreate = jest.fn();
    mockOpenAI = {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
    (OpenAI as any).mockImplementation(() => mockOpenAI);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("initialization", () => {
    test("initializes with API key from options", () => {
      const chat = new ChatTzafon({ apiKey: "explicit-key" });
      expect(chat.apiKey).toBe("explicit-key");
      expect(chat.model).toBe("tzafon.sm-1");
      expect(chat.temperature).toBe(0.7);
    });

    test("initializes with API key from environment", () => {
      const chat = new ChatTzafon();
      expect(chat.apiKey).toBe("test-api-key");
    });

    test("throws error when no API key provided", () => {
      delete process.env.TZAFON_API_KEY;
      expect(() => new ChatTzafon()).toThrow("Tzafon API key is required");
    });

    test("accepts custom model and temperature", () => {
      const chat = new ChatTzafon({
        model: "tzafon.northstar.cua.sft",
        temperature: 0.5,
        maxTokens: 1024,
      });
      expect(chat.model).toBe("tzafon.northstar.cua.sft");
      expect(chat.temperature).toBe(0.5);
      expect(chat.maxTokens).toBe(1024);
    });
  });

  describe("_llmType", () => {
    test("returns correct type", () => {
      const chat = new ChatTzafon();
      expect(chat._llmType()).toBe("tzafon-chat");
    });
  });

  describe("_generate", () => {
    test("calls OpenAI API and returns ChatResult", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: { content: "Hello! How can I help?" },
            finish_reason: "stop",
          },
        ],
        model: "tzafon.sm-1",
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      });

      const chat = new ChatTzafon();
      const messages = [new HumanMessage("Hello")];
      const result = await chat._generate(messages, {});

      expect(result.generations).toHaveLength(1);
      expect(result.generations[0].text).toBe("Hello! How can I help?");
      expect(result.llmOutput?.tokenUsage?.totalTokens).toBe(15);
    });

    test("converts different message types correctly", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Response" }, finish_reason: "stop" }],
        model: "tzafon.sm-1",
      });

      const chat = new ChatTzafon();
      const messages = [
        new SystemMessage("You are helpful"),
        new HumanMessage("Hi"),
        new AIMessage("Hello!"),
        new HumanMessage("How are you?"),
      ];

      await chat._generate(messages, {});

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: "system", content: "You are helpful" },
            { role: "user", content: "Hi" },
            { role: "assistant", content: "Hello!" },
            { role: "user", content: "How are you?" },
          ],
        })
      );
    });
  });

  describe("_streamResponseChunks", () => {
    test("yields chunks from stream", async () => {
      const mockStream = (async function* () {
        yield { choices: [{ delta: { content: "Hello" }, finish_reason: null }] };
        yield { choices: [{ delta: { content: " world" }, finish_reason: "stop" }] };
      })();

      mockCreate.mockResolvedValue(mockStream);

      const chat = new ChatTzafon();
      const messages = [new HumanMessage("Test")];
      const chunks: string[] = [];

      for await (const chunk of chat._streamResponseChunks(messages, {})) {
        chunks.push(chunk.text);
      }

      expect(chunks).toEqual(["Hello", " world"]);
    });
  });
});
