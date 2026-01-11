# Tzafon MCP Server

A Model Context Protocol (MCP) server that provides AI agents with the ability to control a remote computer through the [Tzafon](https://tzafon.ai) platform.

## Overview

This MCP server exposes 14 tools that allow AI agents to interact with a browser-based computer session, including navigation, clicking, typing, screenshots, and more. It supports both **stdio** and **HTTP** transports.

## Features

- 🖥️ **Full Computer Control** - Navigate, click, type, scroll, drag, and more
- 📸 **Screenshots** - Capture screenshots as base64-encoded images
- 🔄 **Keep-Alive** - Automatic session management to prevent idle timeouts
- 🌐 **Dual Transport** - Supports both stdio (for CLI tools) and HTTP (for web apps)
- 📊 **0-999 Grid System** - Normalized coordinate system for precise interactions

## Installation

```bash
# Clone the repository
git clone https://github.com/tzafon/tzafon-mcp.git # TODO: update once live
cd tzafon-mcp

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your TZAFON_API_KEY to .env
```

## Configuration

### Stdio Transport (CLI tools)

Create a `.env` file with the following variables:

```env
TZAFON_API_KEY=your-api-key-here
```

The stdio transport requires the `TZAFON_API_KEY` environment variable.

### HTTP Transport (web applications)

For the HTTP server, the API key is **optional** in the environment. Instead, clients provide their API key via the `Authorization` header when connecting:

```env
MCP_PORT=3000  # Optional, defaults to 3000
```

Get your API key from [Tzafon Dashboard](https://tzafon.ai/dashboard).

## Usage

### Stdio Transport (for CLI tools like Claude Desktop)

```bash
# Development
pnpm dev:stdio

# Production
pnpm build:stdio
node build/stdio.js
```

### HTTP Transport (for web applications)

```bash
# Development
pnpm dev:server

# Production
pnpm build:server
node build/server.js
```

### MCP Inspector (for debugging)

```bash
pnpm inspect:stdio
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker compose up -d

# Or build manually
docker build -t tzafon-mcp .
docker run -d -p 5400:5400 tzafon-mcp

# View logs
docker compose logs -f
```

## Available Tools

| Tool              | Description                           |
| ----------------- | ------------------------------------- |
| `navigate`        | Navigate to a URL                     |
| `take_screenshot` | Capture a screenshot (returns base64) |
| `click`           | Click at grid coordinates (0-999)     |
| `double_click`    | Double-click at grid coordinates      |
| `right_click`     | Right-click at grid coordinates       |
| `type`            | Type text                             |
| `hotkey`          | Press keyboard shortcuts              |
| `scroll`          | Scroll the viewport                   |
| `drag`            | Drag from one point to another        |
| `mouse_down`      | Press mouse button at coordinates     |
| `mouse_up`        | Release mouse button at coordinates   |
| `getHTML`         | Get the current page's HTML content   |
| `wait`            | Wait for a specified time             |

### Coordinate System

All coordinate-based tools use a **0-999 grid system**:

- `(0, 0)` = Top-left corner
- `(999, 999)` = Bottom-right corner
- `(500, 500)` = Center of viewport

This normalized system ensures consistent behavior across different screen resolutions.

## Integration with Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tzafon": {
      "command": "node",
      "args": ["/path/to/tzafon-mcp/build/stdio.js"],
      "env": {
        "TZAFON_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Development

### Project Structure

```
tzafon-mcp/
├── src/
│   ├── core/
│   │   ├── client.ts      # Tzafon API client
│   │   ├── keepAlive.ts   # Session keep-alive
│   │   ├── server.ts      # MCP tool registration
│   │   └── telemetry.ts   # Logging
│   ├── handlers/
│   │   ├── get.ts         # HTTP GET handler
│   │   ├── post.ts        # HTTP POST handler
│   │   └── delete.ts      # HTTP DELETE handler
│   ├── server.ts          # HTTP server entry
│   └── stdio.ts           # Stdio server entry
├── tests/                  # Test suite
└── vitest.config.ts       # Test configuration
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

**Test Coverage: 79.29% | 86 tests passing**

### Building

```bash
# Build stdio server
pnpm build:stdio

# Build HTTP server
pnpm build:server
```

## API Reference

### HTTP Endpoints

| Method | Path   | Description                  |
| ------ | ------ | ---------------------------- |
| POST   | `/mcp` | Handle MCP requests          |
| GET    | `/mcp` | SSE connection for streaming |
| DELETE | `/mcp` | Terminate session            |

All requests require the `mcp-session-id` header (except initial POST).

### Authentication

For the HTTP transport, you can provide the Tzafon API key via the `Authorization` header:

```
Authorization: Bearer your-api-key-here
```

This allows different users to use different API keys without modifying the server configuration. If no `Authorization` header is provided, the server falls back to the `TZAFON_API_KEY` environment variable.

## Tech Stack

- **TypeScript** - Type-safe development
- **MCP SDK** - Model Context Protocol implementation
- **Express** - HTTP server framework
- **Tzafon SDK** - Computer control API
- **Vitest** - Fast unit testing
- **Pino** - Structured logging

## Resources

- [Tzafon Documentation](https://docs.tzafon.ai)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## License

ISC
