# crewai-tzafon

A CrewAI tool for loading web pages using **[Tzafon's](https://tzafon.ai)** cloud-based headless browser infrastructure.

`crewai-tzafon` enables your CrewAI agents to scrape modern web applications with full JavaScript rendering, handling SPAs and dynamically loaded content seamlessly.

---

## Features

- **Cloud-Based Headless Browser**: Powered by Tzafon's remote browser instances
- **JavaScript Support**: Naturally handles SPAs and dynamically loaded content
- **Easy Integration**: Works seamlessly with CrewAI's tool system
- **Flexible Output**: Extract either text content or raw HTML
- **Production Ready**: Built on Playwright for reliable web scraping

---

## Installation

```bash
pip install crewai-tzafon
```

_Note: This package requires Playwright for connecting to the remote browser._

---

## Configuration

To use this package, you need a Tzafon API Key.

1. Sign up or log in at **[tzafon.ai](https://tzafon.ai)** to get your API key.
2. Set it as an environment variable (recommended):

```bash
export TZAFON_API_KEY="your_api_key_here"
```

Alternatively, you can pass the API key directly when initializing the tool.

For more details, see the [Tzafon documentation](https://docs.lightcone.ai/quickstart#get-your-api-key).

---

## Usage

### Basic Usage

```python
from crewai import Agent, Task, Crew
from crewai_tzafon import TzafonLoadTool

# Initialize the tool
tzafon_tool = TzafonLoadTool()

# Create an agent with the tool
web_researcher = Agent(
    role="Web Researcher",
    goal="Extract information from web pages",
    backstory="Expert at web research and data extraction",
    tools=[tzafon_tool],
    verbose=True
)

# Create a task
research_task = Task(
    description="Research and summarize the content from https://example.com",
    expected_output="A comprehensive summary of the webpage content",
    agent=web_researcher
)

# Create and run the crew
crew = Crew(
    agents=[web_researcher],
    tasks=[research_task]
)

result = crew.kickoff()
print(result)
```

### With Custom API Key

```python
from crewai_tzafon import TzafonLoadTool

# Initialize with explicit API key
tool = TzafonLoadTool(api_key="your_api_key_here")
```

### Extract HTML Instead of Text

```python
from crewai import Agent, Task, Crew
from crewai_tzafon import TzafonLoadTool

# The tool accepts parameters in the task description
tzafon_tool = TzafonLoadTool()

html_extractor = Agent(
    role="HTML Extractor",
    goal="Extract raw HTML from web pages",
    backstory="Specialist in extracting structured HTML content",
    tools=[tzafon_tool],
    verbose=True
)

task = Task(
    description="Extract the HTML from https://example.com",
    expected_output="Raw HTML content of the webpage",
    agent=html_extractor
)

crew = Crew(agents=[html_extractor], tasks=[task])
result = crew.kickoff()
```

### Advanced Example: Multi-Page Research

```python
from crewai import Agent, Task, Crew, Process
from crewai_tzafon import TzafonLoadTool

# Initialize tool
tzafon_tool = TzafonLoadTool()

# Create researcher agent
researcher = Agent(
    role="Senior Web Researcher",
    goal="Conduct comprehensive research across multiple web sources",
    backstory="Expert researcher with deep knowledge of information extraction",
    tools=[tzafon_tool],
    verbose=True
)

# Create analyst agent
analyst = Agent(
    role="Data Analyst",
    goal="Analyze and synthesize research findings",
    backstory="Skilled at finding patterns and insights in data",
    verbose=True
)

# Research task
research_task = Task(
    description="""
    Research the following topics:
    1. Latest AI developments from https://openai.com/blog
    2. AI research trends from https://arxiv.org
    Extract key information from each source.
    """,
    expected_output="Comprehensive research findings from multiple sources",
    agent=researcher
)

# Analysis task
analysis_task = Task(
    description="Analyze the research findings and identify key trends and insights",
    expected_output="Detailed analysis report with key trends and recommendations",
    agent=analyst
)

# Create crew with sequential process
crew = Crew(
    agents=[researcher, analyst],
    tasks=[research_task, analysis_task],
    process=Process.sequential,
    verbose=True
)

result = crew.kickoff()
print(result)
```

---

## API Reference

### `TzafonLoadTool`

A CrewAI tool for loading web pages using Tzafon's headless browser.

#### Initialization Parameters

| Parameter | Type            | Description                                           |
| :-------- | :-------------- | :---------------------------------------------------- |
| `api_key` | `Optional[str]` | Tzafon API key. Defaults to `TZAFON_API_KEY` env var. |

#### Tool Input Schema

When your agent uses this tool, it accepts the following parameters:

| Parameter      | Type   | Description                                                               |
| :------------- | :----- | :------------------------------------------------------------------------ |
| `url`          | `str`  | The URL of the web page to load (required).                               |
| `text_content` | `bool` | If `True` (default), extracts visible text. If `False`, returns raw HTML. |

#### Returns

`str`: The extracted page content (either text or HTML).

---

## How It Works

1. **Tool Initialization**: The TzafonLoadTool connects to Tzafon's API using your API key
2. **Browser Creation**: When invoked, it creates a cloud-based browser instance
3. **Page Loading**: Uses Playwright to connect to the browser and navigate to the URL
4. **Content Extraction**: Waits for the page to fully render, then extracts content
5. **Cleanup**: Automatically terminates the browser instance after extraction

---

## Examples Repository

For more examples and use cases, check out:

- [CrewAI Examples](https://github.com/crewAIInc/crewAI-examples)
- [Tzafon Documentation](https://docs.lightcone.ai)

---

## Troubleshooting

### Common Issues

**API Key Not Found**

```
ValueError: Tzafon API key is required
```

Solution: Set the `TZAFON_API_KEY` environment variable or pass `api_key` when initializing the tool.

**Connection Timeout**
If you experience timeouts, ensure:

- Your API key is valid and active
- You have a stable internet connection
- The target URL is accessible

**Playwright Not Installed**

```
ModuleNotFoundError: No module named 'playwright'
```

Solution: Install playwright: `pip install playwright`

---

## License

This project is licensed under the MIT License.

---

## Links

- [Tzafon Homepage](https://tzafon.ai)
- [Documentation](https://docs.lightcone.ai)
- [GitHub Repository](https://github.com/tzafon/tzafon)
- [CrewAI Documentation](https://docs.crewai.com)

---

## Support

For issues, questions, or contributions:

- Open an issue on [GitHub](https://github.com/tzafon/lightcone/issues)
- Check the [documentation](https://docs.lightcone.ai)
