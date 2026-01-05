# Tzafon AutoGen Integration

An example AutoGen agent that scrapes Wikipedia pages using [Tzafon](https://www.tzafon.ai/computer)'s browser automation runtime.

## About Tzafon

[Tzafon](https://www.tzafon.ai/computer) is a runtime for agent automation, built in Rust for AI automation at scale. It provides:

- **Lightweight performance**: 75x less CPU and 74% less memory than standard headless runtimes
- **Resilient under load**: 99.99% reliability and 4.8x faster cold starts
- **Isolated by design**: Each environment runs in a Firecracker micro-VM
- **Unified API surface**: Launch and scale Browser, Sandbox, and Linux from a single API

## Features

This example demonstrates:

- Creating an AutoGen `AssistantAgent` with a custom tool
- Using Tzafon's `Computer` API to spin up browser instances for web scraping
- Streaming agent responses to the console
- Tool reflection for natural language responses

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) package manager
- A Tzafon API key (get one at [tzafon.ai/dashboard](https://www.tzafon.ai/dashboard))
- An OpenAI API key (get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys))

## Installation

1. **Clone the repository** and navigate to this directory:

   ```bash
   cd integrations/autogen/py
   ```

2. **Install dependencies** using uv:

   ```bash
   uv sync
   ```

3. **Set up environment variables**:

   Copy the example `.env` file and fill in your API keys:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your keys:

   ```env
   TZAFON_API_KEY=your_tzafon_api_key  # Get it from https://www.tzafon.ai/dashboard
   OPENAI_API_KEY=your_openai_api_key  # Get it from https://platform.openai.com/api-keys
   ```

## Running the Example

Run the script with uv:

```bash
uv run main.py
```

The agent will:

1. Receive a task to find the population of San Francisco from Wikipedia
2. Use the `wikipedia_scraper` tool to fetch the page content via Tzafon
3. Parse the content and respond with the answer

### Expected Output

```
---------- TextMessage (user) ----------
What is the population of San Francisco according to this https://en.wikipedia.org/wiki/San_Francisco?
---------- ToolCallRequestEvent (wikipedia_scraper_agent) ----------
[FunctionCall(id='...', arguments='{"url":"https://en.wikipedia.org/wiki/San_Francisco"}', name='wikipedia_scraper')]
---------- ToolCallExecutionEvent (wikipedia_scraper_agent) ----------
[FunctionExecutionResult(content='...', name='wikipedia_scraper', call_id='...', is_error=False)]
---------- ModelClientStreamingChunkEvent (wikipedia_scraper_agent) ----------
According to the Wikipedia page, San Francisco has a population of approximately 827,526...
```

## Project Structure

```
.
├── main.py           # Main AutoGen agent script
├── pyproject.toml    # Project dependencies
├── .env.example      # Example environment variables
├── .env              # Your environment variables (not committed)
└── README.md         # This file
```

## Dependencies

- `autogen-agentchat` - AutoGen AgentChat library for building AI agents
- `autogen-ext[openai]` - AutoGen extension for OpenAI models
- `tzafon` - Tzafon Computer API for browser automation
- `pydantic` - Data validation using Python type hints
- `dotenv` - Environment variable management

## Learn More

- [Tzafon Computer](https://www.tzafon.ai/computer) - Runtime for agent automation
- [Tzafon Dashboard](https://www.tzafon.ai/dashboard) - Get your API key
- [Tzafon Documentation](https://docs.tzafon.ai) - Developer documentation
- [AutoGen Documentation](https://microsoft.github.io/autogen/stable/) - AutoGen framework docs

## License

MIT
