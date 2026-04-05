#!/usr/bin/env python3
"""
Example: Integration with LangChain using OpenAI compatibility
Demonstrates how to use Tzafon/Lightcone with LangChain
"""

import os


def main():
    """
    Demonstrate LangChain integration with Tzafon
    """
    try:
        from langchain_openai import ChatOpenAI
        from langchain.schema import HumanMessage, SystemMessage
    except ImportError:
        print("❌ LangChain not installed")
        print("   Install with: pip install langchain langchain-openai")
        return

    print("🦜 LangChain + Tzafon Integration\n")

    # Initialize LangChain with Tzafon endpoint
    llm = ChatOpenAI(
        model="tzafon.northstar-cua-fast",
        openai_api_key=os.getenv("TZAFON_API_KEY"),
        openai_api_base="https://api.tzafon.ai/v1",
        temperature=0.7
    )

    print("=" * 80)
    print("Example: Simple LangChain Chat")
    print("=" * 80)

    messages = [
        SystemMessage(content="You are an expert in computer automation."),
        HumanMessage(content="Explain how Northstar can automate desktop tasks.")
    ]

    print("\n📤 Sending messages to Tzafon via LangChain...")
    response = llm.invoke(messages)

    print(f"\n📥 Response:\n{response.content}\n")

    print("=" * 80)
    print("Example: Streaming with LangChain")
    print("=" * 80)

    print("\n📤 Streaming response: ", end="", flush=True)

    for chunk in llm.stream([HumanMessage(content="List 3 benefits of AI automation.")]):
        print(chunk.content, end="", flush=True)

    print("\n\n✅ LangChain integration example completed!")


if __name__ == "__main__":
    main()
