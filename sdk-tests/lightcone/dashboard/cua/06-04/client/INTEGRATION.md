# Lightcone Agent Integration Guide

Complete guide for integrating the dashboard with Lightcone agents using the provided utilities, types, and hooks.

## Table of Contents

- [Overview](#overview)
- [Type Definitions](#type-definitions)
- [Utility Functions](#utility-functions)
- [Custom Hooks](#custom-hooks)
- [Complete Examples](#complete-examples)
- [API Integration](#api-integration)
- [WebSocket Integration](#websocket-integration)

## Overview

The dashboard provides a comprehensive set of utilities for working with Lightcone agent data:

- **Types**: TypeScript interfaces for all agent data structures
- **Utils**: Functions for parsing markdown summaries and formatting data
- **Hooks**: React hooks for fetching results and real-time updates

## Type Definitions

All types are defined in `/Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/dash-app/lib/types.ts`.

### TaskSummary

Complete parsed task summary from markdown files.

```typescript
interface TaskSummary {
  date: string;
  instructionsFile: string;
  expectedScreenshot?: string;
  completionMessage: string;
  totalEvents: number;
  taskStatus: 'completed' | 'failed' | 'interrupted' | 'running';
  taskSteps: TaskStep[];
  screenshotComparison?: ScreenshotComparison;
  verificationResult?: VerificationResult;
  notes?: string;
  rawContent?: string;
}
```

### VerificationResult

Verification status for completed tasks.

```typescript
interface VerificationResult {
  status: 'passed' | 'failed' | 'inconclusive' | 'not_verified';
  statusMessage: string;
  details?: string;
  timestamp: string;
  expectedScreenshotAccessible: boolean;
}
```

### AgentEvent

Individual event from agent execution.

```typescript
interface AgentEvent {
  eventNumber: number;
  timestamp: string;
  type?: 'started' | 'progress' | 'action' | 'completed' | 'error';
  data: Record<string, any>;
  rawEvent: string;
}
```

### Screenshot

Screenshot metadata with extended properties.

```typescript
interface Screenshot {
  id: string;
  path: string;
  filename: string;
  timestamp: string;
  type: 'expected' | 'actual' | 'comparison';
  width?: number;
  height?: number;
  fileSize?: number;
  taskId?: string;
  metadata?: Record<string, any>;
}
```

## Utility Functions

All utilities are in `/Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/dash-app/lib/utils.ts`.

### Parsing Functions

#### parseMarkdownSummary

Parse markdown summary files into structured TaskSummary objects.

```typescript
import { parseMarkdownSummary } from '@/lib/utils';

const markdownContent = `
# Task Execution Summary

**Date:** 2026-04-05 19:57:47
**Instructions File:** instructions/home_completions.md
**Expected Screenshot:** expected/home_completions.png

## Completion Message

- [x] Navigated to dashboard
- [x] Logged in successfully
- [x] Clicked Completions card

## Event Statistics

- **Total Events:** 85
- **Task Status:** Completed
`;

const summary = parseMarkdownSummary(markdownContent);
console.log(summary.taskStatus); // 'completed'
console.log(summary.totalEvents); // 85
console.log(summary.taskSteps); // Array of 3 steps, all completed
```

#### extractTaskSteps

Extract task steps with checkbox status.

```typescript
import { extractTaskSteps } from '@/lib/utils';

const steps = extractTaskSteps(markdownContent);

steps.forEach(step => {
  console.log(`${step.completed ? '✓' : '○'} ${step.description}`);
});

// Output:
// ✓ Navigated to dashboard
// ✓ Logged in successfully
// ✓ Clicked Completions card
```

#### getVerificationStatus

Extract verification result from summary.

```typescript
import { getVerificationStatus } from '@/lib/utils';

const result = getVerificationStatus(markdownContent);

console.log(result.status); // 'passed', 'failed', 'inconclusive', or 'not_verified'
console.log(result.statusMessage); // Human-readable message
console.log(result.expectedScreenshotAccessible); // boolean
```

### Formatting Functions

#### formatTimestamp

Format timestamps in various ways.

```typescript
import { formatTimestamp } from '@/lib/utils';

// Absolute formatting (default)
formatTimestamp('2026-04-05T19:57:47')
// => 'Apr 5, 2026 at 7:57 PM'

// Relative time
formatTimestamp(new Date(), { relative: true })
// => 'just now'
formatTimestamp(twoHoursAgo, { relative: true })
// => '2 hours ago'

// Custom formats
formatTimestamp(date, { format: 'short' })
// => 'Apr 5 at 7:57 PM'

formatTimestamp(date, { format: 'full' })
// => 'Saturday, April 5, 2026 at 7:57:47 PM'

formatTimestamp(date, { includeTime: false })
// => 'Apr 5, 2026'
```

#### formatDuration

Format durations in human-readable format.

```typescript
import { formatDuration } from '@/lib/utils';

formatDuration(5000)      // => '5s'
formatDuration(125000)    // => '2m 5s'
formatDuration(3665000)   // => '1h 1m 5s'
```

#### getStatusColor

Get Tailwind CSS color class for status badges.

```typescript
import { getStatusColor } from '@/lib/utils';

const colorClass = getStatusColor('passed');     // => 'green'
const colorClass = getStatusColor('failed');     // => 'red'
const colorClass = getStatusColor('running');    // => 'blue'

// Use in JSX
<span className={`text-${getStatusColor(status)}-600`}>
  {status}
</span>
```

## Custom Hooks

### useResults Hook

Fetch and manage task results with automatic refresh and filtering.

```typescript
import { useResults } from '@/hooks';

function ResultsDashboard() {
  const {
    results,      // TaskResult[]
    loading,      // boolean
    error,        // string | null
    lastFetch,    // Date | null
    refresh,      // () => void
    fetchResult,  // (taskId: string) => Promise<TaskResult | null>
    fetchSummary  // (path: string) => Promise<TaskSummary | null>
  } = useResults({
    autoRefresh: true,
    refreshInterval: 5000,
    filter: {
      status: ['completed', 'failed'],
      sortBy: 'date',
      sortOrder: 'desc',
      limit: 50
    },
    apiBaseUrl: '/api'
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <header>
        <h1>Task Results</h1>
        <button onClick={refresh}>Refresh</button>
        {lastFetch && (
          <span>Last updated: {formatTimestamp(lastFetch, { relative: true })}</span>
        )}
      </header>

      {results.map(result => (
        <ResultCard key={result.taskId} result={result} />
      ))}
    </div>
  );
}
```

**Options:**

- `autoRefresh` - Enable automatic refresh (default: false)
- `refreshInterval` - Refresh interval in ms (default: 10000)
- `filter` - ResultsFilter object for filtering
- `apiBaseUrl` - API base URL (default: '/api')

**Filter Options:**

```typescript
interface ResultsFilter {
  status?: 'completed' | 'failed' | 'interrupted' | 'running' | Array<...>;
  dateFrom?: string;     // ISO date string
  dateTo?: string;       // ISO date string
  instructionsFile?: string;  // Partial match
  verificationStatus?: 'passed' | 'failed' | 'inconclusive' | 'not_verified' | Array<...>;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'status' | 'events';
  sortOrder?: 'asc' | 'desc';
}
```

### useResult Hook

Fetch a single result by task ID.

```typescript
import { useResult } from '@/hooks';

function ResultDetailPage({ taskId }: { taskId: string }) {
  const {
    result,   // TaskResult | null
    loading,  // boolean
    error,    // string | null
    refresh   // () => void
  } = useResult(taskId, {
    refreshInterval: 3000  // Auto-refresh every 3 seconds
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!result) return <NotFound />;

  return (
    <div>
      <h1>{result.summary?.instructionsFile}</h1>
      <StatusBadge status={result.status} />

      <section>
        <h2>Task Steps</h2>
        {result.summary?.taskSteps.map((step, i) => (
          <div key={i}>
            {step.completed ? '✓' : '○'} {step.description}
          </div>
        ))}
      </section>

      <section>
        <h2>Events ({result.eventCount})</h2>
        {result.events?.map(event => (
          <EventItem key={event.eventNumber} event={event} />
        ))}
      </section>
    </div>
  );
}
```

### useWebSocket Hook

Manage WebSocket connections for real-time updates.

```typescript
import { useWebSocket } from '@/hooks';

function LiveDashboard() {
  const {
    connected,        // boolean
    lastMessage,      // WebSocketMessage | undefined
    error,            // string | undefined
    reconnectAttempts,// number
    send,             // (message: any) => boolean
    reconnect,        // () => void
    disconnect,       // () => void
    state             // WebSocketState
  } = useWebSocket('ws://localhost:3000/ws', {
    autoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
    onMessage: (message) => {
      console.log('Received:', message.type);
    },
    onOpen: () => console.log('Connected!'),
    onClose: (event) => console.log('Disconnected:', event.code),
    onError: (error) => console.error('Error:', error),
    debug: true
  });

  return (
    <div>
      <div className="connection-status">
        {connected ? (
          <span className="text-green-600">🟢 Connected</span>
        ) : (
          <span className="text-red-600">🔴 Disconnected</span>
        )}
        {reconnectAttempts > 0 && (
          <span>Reconnecting... (attempt {reconnectAttempts})</span>
        )}
      </div>

      {error && (
        <div className="error">
          {error}
          <button onClick={reconnect}>Retry</button>
        </div>
      )}

      {lastMessage && (
        <div className="last-message">
          <strong>{lastMessage.type}</strong>
          <pre>{JSON.stringify(lastMessage.payload, null, 2)}</pre>
        </div>
      )}

      <button onClick={() => send({ type: 'ping', timestamp: Date.now() })}>
        Send Ping
      </button>
    </div>
  );
}
```

### useLiveTaskEvents Hook

Track live task events with automatic aggregation.

```typescript
import { useLiveTaskEvents, formatDuration, calculateTaskDuration } from '@/hooks';

function LiveTaskMonitor({ taskId }: { taskId: string }) {
  const {
    events,       // AgentEvent[]
    status,       // 'idle' | 'started' | 'running' | 'completed' | 'failed'
    connected,    // boolean
    error,        // string | undefined
    clearEvents,  // () => void
    reconnect     // () => void
  } = useLiveTaskEvents('ws://localhost:3000/ws', taskId);

  const duration = calculateTaskDuration(events);

  return (
    <div>
      <header>
        <h1>Task: {taskId}</h1>
        <StatusBadge status={status} />
        <div>
          {connected ? '🟢 Live' : '🔴 Offline'}
        </div>
      </header>

      <div className="stats">
        <div>Events: {events.length}</div>
        <div>Duration: {formatDuration(duration)}</div>
        <div>Status: {status}</div>
      </div>

      <div className="event-stream">
        {events.map(event => (
          <div key={event.eventNumber} className="event">
            <span className="event-number">#{event.eventNumber}</span>
            <span className="event-time">
              {formatTimestamp(event.timestamp, { format: 'short' })}
            </span>
            <span className="event-type">{event.type}</span>
            <pre>{event.rawEvent}</pre>
          </div>
        ))}
      </div>

      <div className="actions">
        <button onClick={clearEvents}>Clear Events</button>
        {!connected && <button onClick={reconnect}>Reconnect</button>}
      </div>
    </div>
  );
}
```

## Complete Examples

### Full Dashboard with Live Updates

```typescript
import {
  useResults,
  useLiveTaskEvents,
  formatTimestamp,
  formatDuration,
  getStatusColor
} from '@/hooks';

function CompleteDashboard() {
  const {
    results,
    loading,
    error,
    refresh
  } = useResults({
    autoRefresh: true,
    refreshInterval: 5000,
    filter: {
      sortBy: 'date',
      sortOrder: 'desc'
    }
  });

  const {
    events,
    status,
    connected
  } = useLiveTaskEvents('ws://localhost:3000/ws');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Lightcone Agent Dashboard</h1>
        <div className="status">
          {connected ? '🟢 Live' : '🔴 Offline'}
        </div>
        <button onClick={refresh}>Refresh</button>
      </header>

      <div className="dashboard-grid">
        {/* Results Section */}
        <section className="results-section">
          <h2>Task Results</h2>
          {results.map(result => (
            <div key={result.taskId} className="result-card">
              <div className="result-header">
                <h3>{result.summary?.instructionsFile}</h3>
                <span className={`badge badge-${getStatusColor(result.status)}`}>
                  {result.status}
                </span>
              </div>

              <div className="result-meta">
                <span>
                  {formatTimestamp(result.summary?.date || '', { relative: true })}
                </span>
                <span>{result.eventCount} events</span>
                {result.elapsedTime && (
                  <span>{formatDuration(result.elapsedTime * 1000)}</span>
                )}
              </div>

              {result.summary?.taskSteps && (
                <div className="task-steps">
                  {result.summary.taskSteps.map((step, i) => (
                    <div key={i} className="task-step">
                      {step.completed ? '✓' : '○'} {step.description}
                    </div>
                  ))}
                </div>
              )}

              {result.summary?.verificationResult && (
                <div className={`verification-badge verification-${result.summary.verificationResult.status}`}>
                  {result.summary.verificationResult.statusMessage}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Live Events Section */}
        <section className="live-events-section">
          <h2>Live Events</h2>
          <div className="live-status">
            Status: <strong>{status}</strong>
          </div>
          <div className="event-count">
            {events.length} events received
          </div>
          <div className="event-list">
            {events.slice(-10).reverse().map(event => (
              <div key={event.eventNumber} className="event-item">
                <span className="event-number">#{event.eventNumber}</span>
                <span className="event-type">{event.type}</span>
                <span className="event-time">
                  {formatTimestamp(event.timestamp, { relative: true })}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

## API Integration

The hooks expect these API endpoints to be available:

### GET /api/results

```typescript
// Query parameters
{
  status?: string | string[],
  dateFrom?: string,
  dateTo?: string,
  instructionsFile?: string,
  verificationStatus?: string | string[],
  limit?: number,
  offset?: number,
  sortBy?: 'date' | 'status' | 'events',
  sortOrder?: 'asc' | 'desc'
}

// Response
{
  success: true,
  data: TaskResult[]
}
```

### GET /api/results/:taskId

```typescript
// Response
{
  success: true,
  data: TaskResult
}
```

### GET /api/summaries?path=:path

```typescript
// Response: Raw markdown content
```

## WebSocket Integration

### Message Format

```typescript
interface WebSocketMessage {
  type: 'task_started' | 'task_progress' | 'task_completed' | 'task_failed' | 'event';
  taskId: string;
  timestamp: string;
  payload: any;
}
```

### Example WebSocket Server (Node.js)

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send task started event
  ws.send(JSON.stringify({
    type: 'task_started',
    taskId: 'task-123',
    timestamp: new Date().toISOString(),
    payload: { instruction: 'Login to dashboard' }
  }));

  // Send progress events
  const interval = setInterval(() => {
    ws.send(JSON.stringify({
      type: 'event',
      taskId: 'task-123',
      timestamp: new Date().toISOString(),
      payload: {
        type: 'progress',
        message: 'Processing...'
      }
    }));
  }, 1000);

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});
```

## Error Handling

All hooks include proper error handling:

```typescript
// Hooks never throw - they return error state
const { error } = useResults();
if (error) {
  return <ErrorComponent message={error} />;
}

// WebSocket hooks auto-reconnect on disconnect
const { connected, reconnect } = useWebSocket(url);
if (!connected) {
  return (
    <div>
      Disconnected
      <button onClick={reconnect}>Reconnect</button>
    </div>
  );
}
```

## TypeScript Support

All utilities and hooks are fully typed with comprehensive JSDoc comments:

```typescript
import type { TaskSummary, VerificationResult } from '@/lib/types';
import { parseMarkdownSummary, getVerificationStatus } from '@/lib/utils';

// Full type inference
const summary: TaskSummary = parseMarkdownSummary(content);
const result: VerificationResult = getVerificationStatus(content);

// IntelliSense shows all available properties and methods
```

## Best Practices

1. **Use autoRefresh sparingly** - Only enable for dashboards that need real-time data
2. **Filter on the server** - Use the filter parameter to reduce data transfer
3. **Handle loading states** - Always show loading indicators during data fetch
4. **Handle errors gracefully** - Display user-friendly error messages
5. **Cleanup WebSocket connections** - Hooks automatically cleanup, but be mindful of multiple connections
6. **Use TypeScript** - Take advantage of full type safety and IntelliSense

## File Locations

All integration utilities are located in:

- Types: `/Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/dash-app/lib/types.ts`
- Utils: `/Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/dash-app/lib/utils.ts`
- Hooks: `/Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/dash-app/hooks/`
