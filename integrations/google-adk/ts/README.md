# Google ADK x Tzafon MCP Integration (TypeScript)

This project demonstrates how to integrate [Google's Agent Development Kit (ADK)](https://google.github.io/adk-docs/) with the [Tzafon MCP server](https://github.com/eddieogola/tzafon/tree/main/integrations/mcp/tzafon-mcp) using TypeScript.

## Features

- **Google ADK Orchestration**: Uses `@google/adk` for agent life-cycle and orchestration.
- **Tzafon Browser Automation**: Leverages Tzafon's Computer Use capabilities via the Model Context Protocol (MCP).
- **Gemini Native Support**: Optimized for latest Gemini models for high-reasoning browser tasks.
- **Proxy Support**: Pre-configured with `--proxies` for secure and distributed browser automation.

## Prerequisites

- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager.
- [Node.js](https://nodejs.org/) (v18 or later).
- **Tzafon API Key**: Get yours at [tzafon.ai](https://www.tzafon.ai/dashboard).
- **Gemini API Key**: Required for the agent model.

## Setup

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in the project root (use `.env.example` as a template):
    ```env
    TZAFON_API_KEY=your_tzafon_key_here
    GEMINI_API_KEY=your_gemini_key_here
    ```
4.  **Local MCP Setup**:
    In `agent.ts`, replace the `"Tzafon MCP Path Here"` placeholder with the absolute path to your `stdio.js` build of the Tzafon MCP server:
    ```typescript
    args: [
      "/absolute/path/to/tzafon-mcp/build/stdio.js",
      "--proxies",
    ],
    ```

## Usage

### Run with ADK CLI
Run the agent directly using the ADK devtools:

```bash
pnpm dev
```

### Run with ADK Web UI
The ADK provides a beautiful web interface to interact with your agent:

```bash
pnpm web
```

## Project Structure

- `agent.ts`: Main agent definition and toolset integration.
- `package.json`: Dependency management and scripts.
- `tsconfig.json`: TypeScript configuration.
- `.env.example`: Template for API credentials.

## About Tzafon

Tzafon provides hosted "computer-as-a-service" for AI agents. It allows LLMs to control a real browser, interact with websites, and automate complex workflows just like a human would.

For more information, visit [tzafon.ai](https://www.tzafon.ai/computer) or check out the [documentation](https://docs.tzafon.ai/).
