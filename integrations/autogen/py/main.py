"""
AutoGen script with an AI agent that can scrape Wikipedia pages using Tzafon.

This example demonstrates how to create an AssistantAgent with a custom web scraping
tool powered by Tzafon's browser automation, using the AutoGen AgentChat library.
"""

import asyncio
import os

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient
from tzafon import Computer
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

BASE_URL = "https://api.tzafon.ai"
TZAFON_API_KEY = os.getenv("TZAFON_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = Computer()

class WikipediaScraperResponse(BaseModel):
    """Response model for the Wikipedia scraper tool.

    Attributes:
        success: Whether the scraping operation was successful.
        message: Error message if the operation failed, empty string otherwise.
        content: The HTML content of the scraped Wikipedia page.
    """

    success: bool
    message: str
    content: str

async def wikipedia_scraper(url: str) -> WikipediaScraperResponse:
    """Scrape the HTML content of a Wikipedia page using Tzafon browser automation.

    This tool uses Tzafon's Computer API to spin up a browser instance,
    navigate to the specified URL, and extract the page's HTML content.

    Args:
        url: The Wikipedia URL to scrape (e.g., https://en.wikipedia.org/wiki/San_Francisco).

    Returns:
        WikipediaScraperResponse containing the success status and HTML content.
    """
    try:
        with client.create(kind="browser") as computer:
            computer.navigate(url)
            computer.wait(2)
            result = computer.html()
            html_content = computer.get_html_content(result)
            return WikipediaScraperResponse(success=True, message="", content=html_content)
    except Exception as e:
        return WikipediaScraperResponse(success=False, message=str(e), content="")


async def main() -> None:
    """Main function to run the AutoGen agent with the Wikipedia scraper tool."""

    # Define a model client using OpenAI's GPT-4o model.
    # The API key is read from the OPENAI_API_KEY environment variable.
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o",
        api_key=OPENAI_API_KEY,
    )

    # Define an AssistantAgent with the model and the wikipedia_scraper tool.
    agent = AssistantAgent(
        name="wikipedia_scraper_agent",
        model_client=model_client,
        tools=[wikipedia_scraper],
        system_message="Use the wikipedia_scraper tool to scrape the content of wikipedia web pages.",
        reflect_on_tool_use=True,
        model_client_stream=True,  # Enable streaming tokens from the model client.
    )

    # Run the agent with a sample task and stream the messages to the console.
    await Console(agent.run_stream(task="What is the population of San Francisco according to this https://en.wikipedia.org/wiki/San_Francisco?"))

    # Close the connection to the model client.
    await model_client.close()


if __name__ == "__main__":
    asyncio.run(main())
