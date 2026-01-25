/**
 * Simple demo script for ChatTzafon LangChain integration.
 *
 * Make sure to set TZAFON_API_KEY environment variable before running.
 */

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatTzafon } from "@tzafon/langchain-tzafon";
import "dotenv/config";

async function main() {
  // Initialize the chat model
  const chat = new ChatTzafon({ model: "tzafon.northstar.cua.sft", temperature: 0.9 });

  // Simple invocation
  console.log("=== Simple Invocation ===");
  const response = await chat.invoke("Hello! What can you help me with today?");
  console.log(response.content);
  console.log();

  // With structured messages
  console.log("=== With Structured Messages ===");
  const messages = [
    new SystemMessage("You are a helpful coding assistant."),
    new HumanMessage("Write a one stanza poem about the ocean."),
  ];
  const structuredResponse = await chat.invoke(messages);
  console.log(structuredResponse.content);
  console.log();

  // Streaming
  console.log("=== Streaming Response ===");
  for await (const chunk of await chat.stream("Write a haiku about programming.")) {
    process.stdout.write(String(chunk.content));
  }
  console.log();
}

main().catch(console.error);
