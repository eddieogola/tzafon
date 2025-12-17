def main():
    from crewai import Agent, Task, Crew, LLM
    from crewai_tools import HyperbrowserLoadTool, TzafonLoadTool
    import os

    # Initialize tool
    tool = HyperbrowserLoadTool(api_key=os.getenv("HYPERBROWSER_API_KEY"))
    # tool = TzafonLoadTool()

    # Create agent
    web_researcher = Agent(
    role="Web Researcher",
    goal="Scrape websites and extract information",
    backstory="Expert at web research",
    tools=[tool],
    llm=LLM(model="ollama/ministral-3:latest", base_url="http://localhost:11434"),
    verbose=True
    )

    # Create task
    task = Task(
    description="Research the topic: {topic}",
    expected_output="Summary of findings",
    agent=web_researcher
    )

    # Create crew and run
    crew = Crew(agents=[web_researcher], tasks=[task])
    result = crew.kickoff(inputs={"topic": "summarize this article in two sentences https://www.bbc.com/news/articles/c98nm1ry38jo"})
    print(result)


if __name__ == "__main__":
    main()
