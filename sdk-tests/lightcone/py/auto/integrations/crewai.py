from time import time

from utils.term import Colors


def lightcone_browser_tool_crew(client):  # noqa: ARG001
    try:
        start_time = time()
        print(
            f"{Colors.YELLOW}*** CrewAI: Lightcone Browser Tool Crew ***{Colors.RESET}\n"
        )
        print(
            f"Reference: {Colors.BLUE}https://docs.lightcone.ai/integrations/crewai/#example{Colors.RESET}\n"
        )

        from crewai import Agent, Crew, Task
        from crewai.tools import BaseTool
        from tzafon import Lightcone

        class LightconeBrowserTool(BaseTool):
            name: str = "browser"
            description: str = (
                "Browse a website and return a screenshot URL. "
                "Input should be a URL to visit."
            )

            def _run(self, url: str) -> str:
                lc = Lightcone()
                with lc.computer.create(kind="browser") as computer:
                    computer.navigate(url)
                    computer.wait(2)
                    result = computer.screenshot()
                    return computer.get_screenshot_url(result)

        researcher = Agent(
            role="Web Researcher",
            goal="Find information on websites",
            backstory="You are a skilled web researcher.",
            tools=[LightconeBrowserTool()],
        )

        task = Task(
            description="Visit https://news.ycombinator.com and describe the top 3 stories",
            expected_output="A summary of the top 3 stories on Hacker News",
            agent=researcher,
        )

        crew = Crew(agents=[researcher], tasks=[task])
        result = crew.kickoff()
        print(result)

    except Exception as e:
        print(f"\n{Colors.RED}Error in CrewAI example: {e}{Colors.RESET}\n")
    finally:
        end_time = time()
        print(
            f"\n{Colors.GREEN}Execution time: {end_time - start_time:.2f} seconds{Colors.RESET}\n"
        )


def crewai_integration(client):
    lightcone_browser_tool_crew(client)
