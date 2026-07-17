import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/chat-completions";

const basicChatCompletion = example(
  { page: PAGE, anchor: "basic-usage", title: "Chat Completions: Basic Usage" },
  async (client: Lightcone): Promise<void> => {
    const result = await client.chat.createCompletion({
      model: "tzafon.northstar-cua-fast-1.6",
      messages: [{ role: "user", content: "What is the capital of France?" }],
    });
    console.log(result);
  },
);

const toolCallingChatCompletion = example(
  { page: PAGE, anchor: "tool-calling", title: "Chat Completions: Tool Calling" },
  async (client: Lightcone): Promise<void> => {
    const result = await client.chat.createCompletion({
      model: "tzafon.northstar-cua-fast-1.6",
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "get_weather",
            description: "Get the current weather for a location",
            parameters: {
              type: "object",
              properties: {
                location: { type: "string", description: "City name" },
              },
              required: ["location"],
            },
          },
        },
      ],
    });
    console.log(result);

    const models = await client.models.list();
    console.log(models);
  },
);

export default async function chatCompletionsGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Chat Completions ***${Colors.RESET}\n`,
  );
  await basicChatCompletion(client);
  await toolCallingChatCompletion(client);
}
