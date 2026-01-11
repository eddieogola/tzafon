# Google ADK x Tzafon MCP Integration

This project demonstrates how to integrate [Google's Agent Development Kit (ADK)](https://github.com/google/agent-development-kit) with the [Tzafon MCP server](https://github.com/eddieogola/tzafon/tree/main/integrations/mcp/tzafon-mcp) to build powerful browser-based agents.

## Features

- **Google ADK Orchestration**: Uses `google-adk` for agent life-cycle, session management, and reliability.
- **Tzafon Browser Automation**: Leverages Tzafon's Computer Use capabilities via the Model Context Protocol (MCP).
- **Gemini Native Support**: Optimized for `gemini-2.0-pro` (or latest) for high-reasoning browser tasks.
- **Proxy Support**: Pre-configured with `--proxies` for secure and distributed browser automation.

## Prerequisites

- [uv](https://docs.astral.sh/uv/) - Fast Python package manager.
- [Node.js](https://nodejs.org/) (to run the Tzafon MCP server).
- **Tzafon API Key**: Get yours at [tzafon.ai](https://www.tzafon.ai/dashboard).
- **Gemini API Key**: Required for the agent model.

## Setup

1.  **Clone the repository** (if you haven't already).
2.  **Install Python dependencies**:
    ```bash
    uv sync
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in the project root:
    ```env
    TZAFON_API_KEY=your_tzafon_key_here
    GEMINI_API_KEY=your_gemini_key_here
    ```
4.  **Local MCP Setup**:
    In `agent.py`, replace the `"Tzafon MCP Path Here"` placeholder with the absolute path to your `stdio.js` build of the Tzafon MCP server:
    ```python
    args=[
        "/absolute/path/to/tzafon-mcp/build/stdio.js",
        "--proxies",
    ],
    ```

## Usage

Run the agent with:

```bash
uv run agent.py
```

By default, the agent will attempt to:
1. Navigate to `wikipedia.org`.
2. Take a screenshot.
3. Provide feedback based on the visual content.

## Project Structure

- `agent.py`: Main agent definition and toolset integration.
- `pyproject.toml`: Dependency management using `uv`.
- `.adk/`: Local storage for session history and artifacts (SQLAlchemy database).
- `.env`: API credentials (ignored by git).

## About Tzafon

Tzafon provides hosted "computer-as-a-service" for AI agents. It allows LLMs to control a real browser, interact with websites, and automate complex workflows just like a human would.

For more information, visit [tzafon.ai](https://www.tzafon.ai/computer) or check out the [documentation](https://docs.tzafon.ai/).
