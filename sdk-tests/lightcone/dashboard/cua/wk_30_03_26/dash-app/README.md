# Agent Verification Dashboard

A premium dashboard application for monitoring and verifying agent task execution. Built with Next.js, TypeScript, Tailwind CSS, and modern design principles.

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
dash-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── dashboard/         # Dashboard pages
├── components/            # Reusable components
│   ├── ui/               # UI components from taste-skill
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility functions
└── public/               # Static assets

## Features

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- taste-skill design system integration
- Premium dashboard UI components
- RESTful API routes for agent verification data

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## API Routes

The application provides REST API endpoints to serve agent verification data from the parent directory.

### GET /api/results

Lists all verification summaries from `../results/`

**Query Parameters:**
- `id` (optional): Retrieve a specific result by ID

**Response (List):**
```json
{
  "success": true,
  "data": [
    {
      "id": "home_completions",
      "date": "2026-04-05 19:57:47",
      "instructionsFile": "instructions/home_completions.md",
      "expectedScreenshot": "expected/home_completions.png",
      "completionMessage": "...",
      "eventStatistics": {
        "totalEvents": 85,
        "taskStatus": "Completed"
      },
      "notes": "...",
      "status": "failed",
      "rawContent": "..."
    }
  ],
  "message": "Found 1 verification summaries"
}
```

**Response (Single):**
```bash
GET /api/results?id=home_completions
```

Returns the same format as above but with a single item in `data`.

### GET /api/screenshots

Lists available screenshots from `../expected/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "home_completions",
      "filename": "home_completions.png",
      "path": "/absolute/path/to/expected/home_completions.png",
      "size": 310393,
      "created": "2026-04-05T16:53:00.000Z"
    }
  ],
  "message": "Found 1 screenshots"
}
```

### GET /api/logs

Get recent agent logs from `../logs/` with pagination support

**Query Parameters:**
- `file` (optional): Specific log file to read
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Lines per page (default: 100, max: 1000)

**Response (List):**
```json
{
  "success": true,
  "data": [
    {
      "filename": "lightcone_agent_20260405_195655.log",
      "timestamp": "2026-04-05T19:56:55Z",
      "size": 61446,
      "path": "/absolute/path/to/logs/lightcone_agent_20260405_195655.log"
    }
  ],
  "message": "Found 7 log files"
}
```

**Response (File Content):**
```bash
GET /api/logs?file=lightcone_agent_20260405_195655.log&page=1&limit=100
```

```json
{
  "success": true,
  "data": {
    "filename": "lightcone_agent_20260405_195655.log",
    "lines": ["line 1", "line 2", "..."],
    "total": 500,
    "page": 1,
    "pageSize": 100,
    "hasMore": true
  },
  "message": "Retrieved 100 lines from lightcone_agent_20260405_195655.log"
}
```

### Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error message"
}
```

Status codes:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `403`: Forbidden (path security violation)
- `404`: Not found
- `500`: Internal server error

### Security Features

- Path traversal protection on all file operations
- File path validation against allowed directories
- Sanitization of user-provided filenames
- CORS headers for cross-origin requests
- No-cache headers to ensure fresh data

## Lightcone Agent Integration

This dashboard includes comprehensive utilities and hooks for integrating with Lightcone agents. See the sections below for detailed documentation.

### Type Definitions (`lib/types.ts`)

Complete TypeScript types for agent integration:

- `TaskSummary` - Parsed task summary data
- `VerificationResult` - Verification status and details
- `AgentEvent` - Event history structure
- `Screenshot` - Screenshot metadata
- `TaskResult` - Complete task execution result
- `ResultsFilter` - Filter options for queries
- `WebSocketMessage` - WebSocket message types
- `WebSocketState` - WebSocket connection state

### Utility Functions (`lib/utils.ts`)

#### Parsing Functions

- `parseMarkdownSummary(content)` - Parse markdown summaries into structured data
- `extractTaskSteps(content)` - Extract task step checkboxes
- `getVerificationStatus(content)` - Extract verification status
- `parseAgentEvents(data)` - Parse agent events from JSON

#### Formatting Functions

- `formatTimestamp(timestamp, options)` - Format dates (absolute/relative)
- `formatDuration(milliseconds)` - Human-readable duration
- `getStatusColor(status)` - Status color classes
- `truncate(text, maxLength)` - Text truncation

Example:
```typescript
import { parseMarkdownSummary, formatTimestamp } from '@/lib/utils';

const summary = parseMarkdownSummary(content);
formatTimestamp(date, { relative: true }); // '2 hours ago'
```

### Custom Hooks (`hooks/`)

#### `useResults` - Fetch and manage task results

```typescript
const { results, loading, error, refresh } = useResults({
  autoRefresh: true,
  refreshInterval: 5000,
  filter: { status: ['completed'] }
});
```

#### `useResult` - Fetch single result by ID

```typescript
const { result, loading, error } = useResult(taskId);
```

#### `useWebSocket` - Real-time WebSocket connections

```typescript
const { connected, lastMessage, send } = useWebSocket(url, {
  autoReconnect: true,
  onMessage: (msg) => console.log(msg)
});
```

#### `useLiveTaskEvents` - Track live task events

```typescript
const { events, status, connected } = useLiveTaskEvents(url, taskId);
```

All hooks include comprehensive JSDoc documentation and full TypeScript support.
