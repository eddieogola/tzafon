"""
Simple web scraper example using crewai-tzafon.

This example mirrors the testCrew/main.py pattern and demonstrates
how to use TzafonLoadTool in a minimal CrewAI setup.
"""

import os
from crewai import Agent, Task, Crew, LLM
from crewai_tzafon import TzafonLoadTool


def main():
    """
    Simple example of using TzafonLoadTool with CrewAI.
    """
    # Initialize Tzafon tool
    tzafon_tool = TzafonLoadTool()

    # Create agent with local LLM (optional, defaults to OpenAI if OPENAI_API_KEY is set)
    # Uncomment the LLM parameter if you want to use Ollama
    web_researcher = Agent(
        role="Web Researcher",
        goal="Scrape websites and extract information",
        backstory="Expert at web research and content extraction",
        tools=[tzafon_tool],
        # llm=LLM(model="ollama/ministral-3:latest", base_url="http://localhost:11434"),
        verbose=True
    )

    # Create task
    task = Task(
        description="Research the topic: {topic}",
        expected_output="Summary of findings from the webpage",
        agent=web_researcher
    )

    # Create crew and run
    crew = Crew(
        agents=[web_researcher],
        tasks=[task]
    )

    # Example usage
    result = crew.kickoff(
        inputs={
            "topic": "summarize this article in two sentences https://www.bbc.com/news"
        }
    )

    print("\n" + "="*50)
    print("Result:")
    print("="*50)
    print(result)


if __name__ == "__main__":
    main()
