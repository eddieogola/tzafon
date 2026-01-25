"""
Simple demo script for ChatTzafon LangChain integration.

Make sure to set TZAFON_API_KEY environment variable before running.
"""

from langchain_tzafon import ChatTzafon
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv
import os

load_dotenv()


def main():
    # Initialize the chat model
    chat = ChatTzafon(
        model="tzafon.northstar.cua.sft",
        temperature=0.9,
        api_key=os.getenv("TZAFON_API_KEY"),
    )

    # Simple invocation
    print("=== Simple Invocation ===")
    response = chat.invoke("Hello! What can you help me with today?")
    print(response.content)
    print()

    # With structured messages
    print("=== With Structured Messages ===")
    messages = [
        SystemMessage(content="You are a helpful coding assistant."),
        HumanMessage(content="Write a one stanza poem about the ocean."),
    ]
    response = chat.invoke(messages)
    print(response.content)
    print()

    # Streaming
    print("=== Streaming Response ===")
    for chunk in chat.stream("Write a haiku about programming."):
        print(chunk.content, end="", flush=True)
    print()


if __name__ == "__main__":
    main()
