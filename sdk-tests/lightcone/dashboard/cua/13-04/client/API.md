# API Documentation

REST API endpoints for serving agent verification data.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required for API endpoints. CORS headers are set to allow cross-origin requests.

## Endpoints

### 1. List All Results

**Endpoint:** `GET /api/results`

Lists all verification summaries from the `../results/` directory.

**Example Request:**
```bash
curl http://localhost:3000/api/results
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "home_completions",
      "date": "2026-04-05 19:57:47",
      "instructionsFile": "instructions/home_completions.md",
      "expectedScreenshot": "expected/home_completions.png",
      "completionMessage": "**Task Completion Summary:**\n- [x] Navigated to https://lightcone.ai/dashboard\n...",
      "eventStatistics": {
        "totalEvents": 85,
        "taskStatus": "Completed"
      },
      "notes": "### Task Steps Completed\n\nThe agent reported completing the following steps:\n...",
      "status": "failed",
      "rawContent": "# Task Execution Summary\n\n**Date:** 2026-04-05 19:57:47\n..."
    }
  ],
  "message": "Found 1 verification summaries"
}
```

### 2. Get Specific Result

**Endpoint:** `GET /api/results?id={resultId}`

Retrieves a specific verification summary by ID.

**Parameters:**
- `id` (string, required): The result ID (without the `_summary.md` suffix)

**Example Request:**
```bash
curl http://localhost:3000/api/results?id=home_completions
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "home_completions",
    "date": "2026-04-05 19:57:47",
    "instructionsFile": "instructions/home_completions.md",
    "expectedScreenshot": "expected/home_completions.png",
    "completionMessage": "**Task Completion Summary:**\n...",
    "eventStatistics": {
      "totalEvents": 85,
      "taskStatus": "Completed"
    },
    "notes": "### Task Steps Completed\n...",
    "status": "failed",
    "rawContent": "# Task Execution Summary\n..."
  },
  "message": "Retrieved result: home_completions"
}
```

### 3. List Screenshots

**Endpoint:** `GET /api/screenshots`

Lists all available screenshots from the `../expected/` directory.

**Example Request:**
```bash
curl http://localhost:3000/api/screenshots
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "home_completions",
      "filename": "home_completions.png",
      "path": "/Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/expected/home_completions.png",
      "size": 310393,
      "created": "2026-04-05T16:53:00.000Z"
    }
  ],
  "message": "Found 1 screenshots"
}
```

### 4. List Log Files

**Endpoint:** `GET /api/logs`

Lists all agent log files from the `../logs/` directory.

**Example Request:**
```bash
curl http://localhost:3000/api/logs
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "lightcone_agent_20260405_195655.log",
      "timestamp": "2026-04-05T19:56:55Z",
      "size": 61446,
      "path": "/Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/logs/lightcone_agent_20260405_195655.log"
    },
    {
      "filename": "lightcone_agent_20260405_194236.log",
      "timestamp": "2026-04-05T19:42:36Z",
      "size": 57877,
      "path": "/Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/logs/lightcone_agent_20260405_194236.log"
    }
  ],
  "message": "Found 2 log files"
}
```

### 5. Read Log File

**Endpoint:** `GET /api/logs?file={filename}&page={page}&limit={limit}`

Reads the content of a specific log file with pagination support.

**Parameters:**
- `file` (string, required): The log filename
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Lines per page (default: 100, max: 1000)

**Example Request:**
```bash
curl "http://localhost:3000/api/logs?file=lightcone_agent_20260405_195655.log&page=1&limit=50"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "filename": "lightcone_agent_20260405_195655.log",
    "lines": [
      "2026-04-05 19:56:55,123 - INFO - Starting agent...",
      "2026-04-05 19:56:56,456 - INFO - Navigating to https://lightcone.ai/dashboard",
      "..."
    ],
    "total": 500,
    "page": 1,
    "pageSize": 50,
    "hasMore": true
  },
  "message": "Retrieved 50 lines from lightcone_agent_20260405_195655.log"
}
```

## Error Responses

All endpoints return consistent error responses with appropriate HTTP status codes.

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid page number",
  "message": "Page number must be greater than 0"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Invalid file path",
  "message": "Access denied"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Result not found",
  "message": "Could not find result with ID: invalid_id"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch verification summaries",
  "message": "ENOENT: no such file or directory"
}
```

## Type Definitions

### VerificationSummary

```typescript
interface VerificationSummary {
  id: string;
  date: string;
  instructionsFile: string;
  expectedScreenshot: string;
  completionMessage: string;
  eventStatistics: {
    totalEvents: number;
    taskStatus: string;
  };
  notes: string;
  status: 'passed' | 'failed' | 'inconclusive';
  rawContent: string;
}
```

### Screenshot

```typescript
interface Screenshot {
  id: string;
  filename: string;
  path: string;
  size: number;
  created: string;
}
```

### LogEntry

```typescript
interface LogEntry {
  filename: string;
  timestamp: string;
  size: number;
  path: string;
}
```

### LogContent

```typescript
interface LogContent {
  filename: string;
  lines: string[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

## Security Features

1. **Path Traversal Protection**: All file paths are validated to ensure they stay within allowed directories
2. **Filename Sanitization**: User-provided filenames are sanitized to prevent injection attacks
3. **File Extension Validation**: Only allowed file types can be accessed (.md, .log, .png)
4. **CORS Headers**: Configurable for cross-origin requests
5. **No-Cache Headers**: Ensures fresh data on every request

## Usage Examples

### Fetch all results and display summaries

```javascript
async function fetchResults() {
  const response = await fetch('http://localhost:3000/api/results');
  const data = await response.json();

  if (data.success) {
    data.data.forEach(result => {
      console.log(`${result.id}: ${result.status} (${result.eventStatistics.totalEvents} events)`);
    });
  }
}
```

### Get specific result details

```javascript
async function getResultDetails(id) {
  const response = await fetch(`http://localhost:3000/api/results?id=${id}`);
  const data = await response.json();

  if (data.success) {
    console.log('Completion Message:', data.data.completionMessage);
    console.log('Status:', data.data.status);
  }
}
```

### Read log file with pagination

```javascript
async function readLog(filename, page = 1) {
  const response = await fetch(
    `http://localhost:3000/api/logs?file=${filename}&page=${page}&limit=100`
  );
  const data = await response.json();

  if (data.success) {
    console.log(`Page ${data.data.page} of ${Math.ceil(data.data.total / data.data.pageSize)}`);
    data.data.lines.forEach(line => console.log(line));

    if (data.data.hasMore) {
      // Fetch next page
      readLog(filename, page + 1);
    }
  }
}
```

### List all screenshots

```javascript
async function listScreenshots() {
  const response = await fetch('http://localhost:3000/api/screenshots');
  const data = await response.json();

  if (data.success) {
    data.data.forEach(screenshot => {
      console.log(`${screenshot.filename} - ${(screenshot.size / 1024).toFixed(2)} KB`);
    });
  }
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production deployments.

## Caching

API responses include `Cache-Control: no-store, max-age=0` headers to ensure fresh data. Consider implementing caching strategies based on your use case:

- Results: Can be cached until new summaries are generated
- Logs: Should not be cached to ensure real-time monitoring
- Screenshots: Can be cached with long TTL as they rarely change
