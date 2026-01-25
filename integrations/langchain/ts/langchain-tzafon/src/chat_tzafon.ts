/**
 * ChatTzafon - LangChain chat model for Tzafon's AI models.
 *
 * This module provides a LangChain-compatible chat model that integrates with
 * Tzafon's OpenAI-compatible chat completions API.
 */

import type { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import {
    BaseChatModel,
    type BaseChatModelParams,
} from "@langchain/core/language_models/chat_models";
import {
    AIMessage,
    AIMessageChunk,
    type BaseMessage,
    HumanMessage,
    SystemMessage,
} from "@langchain/core/messages";
import {
    ChatGeneration,
    ChatGenerationChunk,
    type ChatResult,
} from "@langchain/core/outputs";
import OpenAI from "openai";

/**
 * Input options for ChatTzafon.
 */
export interface ChatTzafonInput extends BaseChatModelParams {
  /**
   * The Tzafon model to use. Defaults to "tzafon.sm-1".
   */
  model?: string;

  /**
   * Sampling temperature between 0 and 1. Defaults to 0.7.
   */
  temperature?: number;

  /**
   * Maximum number of tokens to generate.
   */
  maxTokens?: number;

  /**
   * Stop sequences.
   */
  stop?: string[];

  /**
   * Tzafon API key. Falls back to TZAFON_API_KEY environment variable.
   */
  apiKey?: string;

  /**
   * Base URL for the Tzafon API. Defaults to "https://api.tzafon.ai/v1".
   */
  baseUrl?: string;
}

/**
 * LangChain chat model for Tzafon's AI models.
 *
 * @example
 * ```typescript
 * import { ChatTzafon } from "@tzafon/langchain-tzafon";
 *
 * const chat = new ChatTzafon({ model: "tzafon.sm-1" });
 * const response = await chat.invoke("Hello!");
 * console.log(response.content);
 * ```
 */
export class ChatTzafon extends BaseChatModel<ChatTzafonInput> {
  model: string;
  temperature: number;
  maxTokens?: number;
  stop?: string[];
  apiKey: string;
  baseUrl: string;

  private client: OpenAI;

  static lc_name(): string {
    return "ChatTzafon";
  }

  constructor(fields: ChatTzafonInput = {}) {
    super(fields);

    const apiKey = fields.apiKey ?? process.env.TZAFON_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Tzafon API key is required. Pass apiKey option or set TZAFON_API_KEY environment variable."
      );
    }

    this.model = fields.model ?? "tzafon.sm-1";
    this.temperature = fields.temperature ?? 0.7;
    this.maxTokens = fields.maxTokens;
    this.stop = fields.stop;
    this.apiKey = apiKey;
    this.baseUrl = fields.baseUrl ?? "https://api.tzafon.ai/v1";

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  _llmType(): string {
    return "tzafon-chat";
  }

  get lc_secrets(): { [key: string]: string } | undefined {
    return {
      apiKey: "TZAFON_API_KEY",
    };
  }

  /**
   * Get the identifying parameters for this model.
   */
  invocationParams() {
    return {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stop: this.stop,
    };
  }

  /**
   * Convert LangChain messages to OpenAI format.
   */
  private convertMessagesToOpenAI(
    messages: BaseMessage[]
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map((message) => {
      let role: "system" | "user" | "assistant";

      if (message instanceof HumanMessage) {
        role = "user";
      } else if (message instanceof AIMessage) {
        role = "assistant";
      } else if (message instanceof SystemMessage) {
        role = "system";
      } else {
        // Default to user for unknown message types
        role = "user";
      }

      return {
        role,
        content: String(message.content),
      };
    });
  }

  /**
   * Generate a chat completion.
   */
  async _generate(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const openaiMessages = this.convertMessagesToOpenAI(messages);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stop: options.stop ?? this.stop,
      stream: false,
    });

    const choice = response.choices[0];
    const content = choice?.message?.content ?? "";

    const generation: ChatGeneration = {
      text: content,
      message: new AIMessage({
        content,
        additional_kwargs: {
          finish_reason: choice?.finish_reason,
        },
      }),
      generationInfo: {
        finish_reason: choice?.finish_reason,
      },
    };

    return {
      generations: [generation],
      llmOutput: {
        tokenUsage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
        modelName: response.model,
      },
    };
  }

  /**
   * Stream chat completion chunks.
   */
  async *_streamResponseChunks(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<ChatGenerationChunk> {
    const openaiMessages = this.convertMessagesToOpenAI(messages);

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stop: options.stop ?? this.stop,
      stream: true,
    });

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      const content = choice?.delta?.content ?? "";

      if (content) {
        const generationChunk = new ChatGenerationChunk({
          text: content,
          message: new AIMessageChunk({
            content,
          }),
          generationInfo: {
            finish_reason: choice?.finish_reason,
          },
        });

        yield generationChunk;

        if (runManager) {
          await runManager.handleLLMNewToken(content);
        }
      }
    }
  }
}
