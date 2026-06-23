import type Lightcone from "@tzafon/lightcone/index.js";
import { Colors } from "@/utils/term";

async function basicChatCompletion(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Chat Completions: Basic Usage ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/chat-completions/#basic-usage${Colors.RESET}\n`,
  );

  try {
    const result = await client.chat.createCompletion({
      model: "tzafon.northstar-cua-fast",
      messages: [{ role: "user", content: "What is the capital of France?" }],
    });
    console.log(result);
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in basic chat completion: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function toolCallingChatCompletion(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Chat Completions: Tool Calling ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/guides/chat-completions/#tool-calling${Colors.RESET}\n`,
  );

  try {
    const result = await client.chat.createCompletion({
      model: "tzafon.northstar-cua-fast",
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
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error in tool-calling chat completion: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function chatCompletionsGuide(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Using Northstar: Chat Completions ***${Colors.RESET}\n`,
  );
  await basicChatCompletion(client);
  await toolCallingChatCompletion(client);
}
