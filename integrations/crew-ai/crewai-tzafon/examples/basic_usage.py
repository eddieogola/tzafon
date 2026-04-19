"""
Basic usage example for crewai-tzafon.

This example demonstrates how to use the TzafonLoadTool with CrewAI agents
to scrape and analyze web content.
"""

import os
from crewai import Agent, Task, Crew
from crewai_tzafon import TzafonLoadTool


def main():
    """
    Example demonstrating basic usage of TzafonLoadTool with CrewAI.
    """
    # Make sure you have set your API keys
    if not os.getenv("TZAFON_API_KEY"):
        print("Error: TZAFON_API_KEY environment variable not set")
        print("Get your API key at: https://docs.lightcone.ai/quickstart#get-your-api-key")
        return

    # Initialize the Tzafon tool
    tzafon_tool = TzafonLoadTool()

    # Create a web researcher agent
    web_researcher = Agent(
        role="Web Research Specialist",
        goal="Extract and analyze information from web pages accurately",
        backstory=(
            "You are an expert web researcher with years of experience in "
            "gathering and analyzing information from various online sources. "
            "You excel at extracting key insights from web content."
        ),
        tools=[tzafon_tool],
        verbose=True
    )

    # Create a research task
    research_task = Task(
        description=(
            "Research the latest developments in AI by visiting "
            "https://openai.com/blog and summarize the key points from "
            "the most recent blog posts."
        ),
        expected_output=(
            "A comprehensive summary of the latest AI developments, "
            "including key technologies, trends, and insights."
        ),
        agent=web_researcher
    )

    # Create and run the crew
    crew = Crew(
        agents=[web_researcher],
        tasks=[research_task],
        verbose=True
    )

    print("\n" + "="*50)
    print("Starting research task...")
    print("="*50 + "\n")

    result = crew.kickoff()

    print("\n" + "="*50)
    print("Research Results:")
    print("="*50)
    print(result)


if __name__ == "__main__":
    main()
