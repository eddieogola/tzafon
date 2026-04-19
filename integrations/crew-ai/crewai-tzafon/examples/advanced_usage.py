"""
Advanced usage example for crewai-tzafon.

This example demonstrates multi-agent collaboration with the TzafonLoadTool
for comprehensive web research and analysis.
"""

import os
from crewai import Agent, Task, Crew, Process
from crewai_tzafon import TzafonLoadTool


def main():
    """
    Example demonstrating advanced multi-agent usage of TzafonLoadTool.
    """
    # Check for API keys
    if not os.getenv("TZAFON_API_KEY"):
        print("Error: TZAFON_API_KEY environment variable not set")
        print("Get your API key at: https://docs.lightcone.ai/quickstart#get-your-api-key")
        return

    # Initialize the tool
    tzafon_tool = TzafonLoadTool()

    # Create multiple specialized agents
    web_scraper = Agent(
        role="Web Scraping Specialist",
        goal="Efficiently extract raw data from multiple web sources",
        backstory=(
            "You are a technical expert in web scraping with deep knowledge "
            "of modern web technologies. You excel at extracting structured "
            "and unstructured data from various websites."
        ),
        tools=[tzafon_tool],
        verbose=True
    )

    data_analyst = Agent(
        role="Senior Data Analyst",
        goal="Analyze extracted web data and identify key patterns and insights",
        backstory=(
            "You are a seasoned data analyst with expertise in pattern recognition "
            "and trend analysis. You transform raw data into actionable insights."
        ),
        verbose=True
    )

    report_writer = Agent(
        role="Technical Writer",
        goal="Create clear, comprehensive reports from analyzed data",
        backstory=(
            "You are an experienced technical writer who excels at transforming "
            "complex technical information into clear, accessible reports."
        ),
        verbose=True
    )

    # Create tasks for each agent
    scraping_task = Task(
        description=(
            "Visit the following websites and extract their main content:\n"
            "1. https://techcrunch.com - Latest tech news\n"
            "2. https://news.ycombinator.com - Developer community discussions\n"
            "Extract the key topics and headlines from each source."
        ),
        expected_output=(
            "A structured collection of headlines, topics, and key information "
            "from each website, organized by source."
        ),
        agent=web_scraper
    )

    analysis_task = Task(
        description=(
            "Analyze the scraped web data to identify:\n"
            "1. Common themes and trending topics\n"
            "2. Emerging technologies or patterns\n"
            "3. Important developments in the tech industry\n"
            "Provide a detailed analysis with supporting evidence."
        ),
        expected_output=(
            "A comprehensive analysis highlighting key trends, patterns, "
            "and insights from the collected data."
        ),
        agent=data_analyst
    )

    reporting_task = Task(
        description=(
            "Create a professional research report that includes:\n"
            "1. Executive summary of findings\n"
            "2. Detailed analysis of trends\n"
            "3. Key takeaways and recommendations\n"
            "Format the report in a clear, structured manner."
        ),
        expected_output=(
            "A well-structured research report with executive summary, "
            "detailed findings, and actionable recommendations."
        ),
        agent=report_writer
    )

    # Create crew with sequential process
    crew = Crew(
        agents=[web_scraper, data_analyst, report_writer],
        tasks=[scraping_task, analysis_task, reporting_task],
        process=Process.sequential,
        verbose=True
    )

    print("\n" + "="*60)
    print("Starting Advanced Multi-Agent Research Pipeline")
    print("="*60 + "\n")

    result = crew.kickoff()

    print("\n" + "="*60)
    print("Final Research Report:")
    print("="*60)
    print(result)


if __name__ == "__main__":
    main()
