# HuggingFace Agent with Tzafon Web Loader

A Python project demonstrating how to create a HuggingFace agent with a Tzafon web loader tool using the `smolagents` framework.

## Features

- **Tzafon Web Loader Tool**: Custom tool that uses Tzafon's browser automation to load and extract HTML content from any URL.
- **smolagents CodeAgent**: A powerful agent that can understand natural language, plan tasks, and execute Python code using tools.
- **OpenAI Integration**: Powered by OpenAI's models (e.g., `gpt-4o`) via `OpenAIServerModel`.
- **Fast Development**: Built with `uv` for lightning-fast dependency management and execution.

## Prerequisites

- [Python 3.12+](https://www.python.org/downloads/)
- [uv](https://github.com/astral-sh/uv) package manager
- [Tzafon API Key](https://tzafon.ai/dashboard)
- [OpenAI API Key](https://platform.openai.com/api-keys)

## Setup

1. **Install dependencies**:
   ```bash
   uv sync
   ```

2. **Configure environment variables**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   TZAFON_API_KEY=your_tzafon_api_key_here
   ```

## Usage

Run the agent:
```bash
uv run main.py
```

The example in `main.py` will ask the agent to:
> "Summarize the first paragraph of the following URL: https://en.wikipedia.org/wiki/Northern_gannet"

## How It Works

1. **TzafonWebLoader**: A custom tool inheriting from `smolagents.Tool`. It uses the `tzafon` Python SDK to:
   - Launch a hosted browser instance.
   - Navigate to the provided URL.
   - Extract the HTML content using `computer.html()`.
2. **OpenAIServerModel**: Configures the agent to use OpenAI's LLM via their API.
3. **CodeAgent**: The core orchestrator that receives the user prompt, decides to use the `tzafon_web_loader` tool, and processes the returned content.

## Configuration

You can customize the behavior in `main.py`:
- **Model**: Change the `OPENAI_MODEL` in `.env` (defaults to `gpt-4o`).
- **Tools**: Add more tools to the `CodeAgent`'s `tools` list.
- **Prompt**: Modify the `agent.run()` call to perform different tasks.

## Example Output

```text
Initializing Agent with OpenAI Model...
Using model: gpt-4o

Agent initialized successfully!
Available tools: ['tzafon_web_loader']

==================================================
Example: Running agent with tzafon web loader task
==================================================

Result: The Northern gannet (Morus bassanus) is the largest species of seabird in the North Atlantic...

==================================================
Tzafon web loader tool is ready to use!
==================================================
```
