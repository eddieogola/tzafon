#!/usr/bin/env python3
"""
Example: Using Tzafon/Lightcone with OpenAI-compatible API
The Tzafon SDK is OpenAI compatible, allowing you to use familiar patterns
"""

import os
from openai import OpenAI


def main():
    """
    Demonstrate OpenAI-compatible usage of Tzafon/Lightcone
    """
    # Initialize OpenAI client with Tzafon endpoint
    client = OpenAI(
        api_key=os.getenv("TZAFON_API_KEY"),
        base_url="https://api.tzafon.ai/v1"
    )

    print("🤖 Using Tzafon with OpenAI-compatible API\n")

    # Example 1: Simple chat completion
    print("=" * 80)
    print("Example 1: Simple Chat Completion")
    print("=" * 80)

    response = client.chat.completions.create(
        model="tzafon.northstar-cua-fast",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "What is Lightcone and how does it work?"}
        ],
        temperature=0.7,
        max_tokens=200
    )

    print(f"\nResponse: {response.choices[0].message.content}\n")

    # Example 2: Streaming chat completion
    print("=" * 80)
    print("Example 2: Streaming Chat Completion")
    print("=" * 80)

    print("\nStreaming response: ", end="", flush=True)

    stream = client.chat.completions.create(
        model="tzafon.northstar-cua-fast",
        messages=[
            {"role": "user", "content": "Explain computer automation in 2 sentences."}
        ],
        stream=True,
        temperature=0.7
    )

    for chunk in stream:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="", flush=True)

    print("\n")

    # Example 3: Chat with tool calling (function calling)
    print("=" * 80)
    print("Example 3: Chat Completion with Tool Calling")
    print("=" * 80)

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather in a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "description": "The temperature unit"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ]

    response = client.chat.completions.create(
        model="tzafon.northstar-cua-fast",
        messages=[
            {"role": "user", "content": "What's the weather like in San Francisco?"}
        ],
        tools=tools,
        tool_choice="auto"
    )

    message = response.choices[0].message

    if message.tool_calls:
        print("\n🛠️  Tool called:")
        for tool_call in message.tool_calls:
            print(f"   Function: {tool_call.function.name}")
            print(f"   Arguments: {tool_call.function.arguments}")
    else:
        print(f"\nResponse: {message.content}")

    print("\n✅ OpenAI compatibility examples completed!")


if __name__ == "__main__":
    # Check if OpenAI is installed
    try:
        import openai
        print(f"✅ OpenAI SDK version: {openai.__version__}\n")
    except ImportError:
        print("❌ OpenAI SDK not installed")
        print("   Install with: pip install openai")
        exit(1)

    main()
