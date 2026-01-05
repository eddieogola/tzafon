"""
AutoGen script with an OpenAI agent that has a tool to calculate the sum of two numbers.

This example demonstrates how to create an AssistantAgent with a custom tool
using the AutoGen AgentChat library.
"""

import asyncio

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient
from tzafon import Computer
from dotenv import load_dotenv

load_dotenv()

client = Computer()


async def calculate_sum(a: float, b: float) -> float:
    """Calculate and return the sum of two numbers.

    Args:
        a: The first number.
        b: The second number.

    Returns:
        The sum of a and b.
    """
    return a + b

async def web_scraper(url: str) -> str:
    """Scrape the content of a web page.

    Args:
        url: The URL of the web page to scrape.

    Returns:
        The content of the web page.
    """
    return 


async def main() -> None:
    """Main function to run the AutoGen agent with the sum calculator tool."""

    # Define a model client using OpenAI's GPT-4o model.
    # The API key is read from the OPENAI_API_KEY environment variable by default.
    model_client = OpenAIChatCompletionClient(
        model="ministral-3:latest",
        api_key="test",
        base_url="http://localhost:11434/v1",
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": True,
            "family": "unknown",
        },
    )

    # Define an AssistantAgent with the model and the calculate_sum tool.
    agent = AssistantAgent(
        name="calculator_agent",
        model_client=model_client,
        tools=[calculate_sum],
        system_message="You are a helpful math assistant. Use the calculate_sum tool to add two numbers when asked.",
        reflect_on_tool_use=True,
        model_client_stream=True,  # Enable streaming tokens from the model client.
    )

    # Run the agent with a sample task and stream the messages to the console.
    await Console(agent.run_stream(task="What is the sum of 42 and 58?"))

    # Close the connection to the model client.
    await model_client.close()


if __name__ == "__main__":
    asyncio.run(main())
