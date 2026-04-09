/**
 * Type definitions for integrating the dashboard with Lightcone agents
 */

/**
 * Interface for parsed task summary data from markdown files
 */
export interface TaskSummary {
  /** Date when the task was executed */
  date: string;

  /** Path to the instructions file used */
  instructionsFile: string;

  /** Path to the expected screenshot for verification */
  expectedScreenshot?: string;

  /** The completion message from the agent */
  completionMessage: string;

  /** Total number of events processed during execution */
  totalEvents: number;

  /** Final status of the task */
  taskStatus: 'completed' | 'failed' | 'interrupted' | 'running';

  /** List of completed task steps with checkbox status */
  taskSteps: TaskStep[];

  /** Screenshot comparison details */
  screenshotComparison?: ScreenshotComparison;

  /** Verification result */
  verificationResult?: VerificationResult;

  /** Additional notes or metadata */
  notes?: string;

  /** Raw content of the summary markdown */
  rawContent?: string;
}

/**
 * Individual task step with completion status
 */
export interface TaskStep {
  /** The step description */
  description: string;

  /** Whether the step is completed (checkbox checked) */
  completed: boolean;

  /** Order/index of the step */
  order: number;
}

/**
 * Screenshot comparison information
 */
export interface ScreenshotComparison {
  /** Page title visible in the screenshot */
  pageTitle?: string;

  /** Main sections visible on the screen */
  mainSections: string[];

  /** Selected options or UI state */
  selectedOptions: Record<string, string>;

  /** Notable UI elements present */
  notableElements: string[];

  /** URL shown in address bar */
  url?: string;

  /** Raw comparison text from agent */
  rawComparison: string;
}

/**
 * Verification result status and details
 */
export interface VerificationResult {
  /** Overall verification status */
  status: 'passed' | 'failed' | 'inconclusive' | 'not_verified';

  /** Human-readable status message */
  statusMessage: string;

  /** Detailed reason for the verification result */
  details?: string;

  /** Timestamp when verification was performed */
  timestamp: string;

  /** Whether the expected screenshot was accessible */
  expectedScreenshotAccessible: boolean;
}

/**
 * Legacy verification summary (for backward compatibility)
 */
export interface VerificationSummary {
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

/**
 * Event history structure for agent execution events
 */
export interface AgentEvent {
  /** Sequential event number */
  eventNumber: number;

  /** ISO timestamp when the event occurred */
  timestamp: string;

  /** Type of event (if available) */
  type?: 'started' | 'progress' | 'action' | 'completed' | 'error';

  /** Event data as key-value pairs */
  data: Record<string, any>;

  /** Raw event string representation */
  rawEvent: string;
}

/**
 * Screenshot metadata
 */
export interface Screenshot {
  /** Unique identifier for the screenshot */
  id: string;

  /** Path to the screenshot file */
  path: string;

  /** Filename of the screenshot */
  filename: string;

  /** When the screenshot was taken */
  timestamp: string;

  /** Type of screenshot */
  type: 'expected' | 'actual' | 'comparison';

  /** Width in pixels */
  width?: number;

  /** Height in pixels */
  height?: number;

  /** File size in bytes */
  fileSize?: number;

  /** Associated task or test identifier */
  taskId?: string;

  /** Additional metadata */
  metadata?: Record<string, any>;

  /** Legacy: file size */
  size?: number;

  /** Legacy: creation date */
  created?: string;
}

export interface LogEntry {
  filename: string;
  timestamp: string;
  size: number;
  path: string;
}

export interface LogContent {
  filename: string;
  lines: string[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Task execution result
 */
export interface TaskResult {
  /** Unique identifier for the task */
  taskId: string;

  /** Task execution status */
  status: 'completed' | 'failed' | 'interrupted' | 'running';

  /** Total number of events processed */
  eventCount: number;

  /** Time taken to complete in seconds */
  elapsedTime?: number;

  /** Path to the summary file */
  summaryPath?: string;

  /** List of all events */
  events?: AgentEvent[];

  /** Parsed task summary */
  summary?: TaskSummary;

  /** Error message if failed */
  error?: string;
}

/**
 * Filter options for querying results
 */
export interface ResultsFilter {
  /** Filter by task status */
  status?: TaskSummary['taskStatus'] | TaskSummary['taskStatus'][];

  /** Filter by date range (ISO date strings) */
  dateFrom?: string;
  dateTo?: string;

  /** Filter by instructions file name (partial match) */
  instructionsFile?: string;

  /** Filter by verification status */
  verificationStatus?: VerificationResult['status'] | VerificationResult['status'][];

  /** Limit number of results */
  limit?: number;

  /** Offset for pagination */
  offset?: number;

  /** Sort order */
  sortBy?: 'date' | 'status' | 'events';
  sortOrder?: 'asc' | 'desc';
}

/**
 * WebSocket message types for real-time updates
 */
export interface WebSocketMessage {
  /** Message type */
  type: 'task_started' | 'task_progress' | 'task_completed' | 'task_failed' | 'event';

  /** Task identifier */
  taskId: string;

  /** Message timestamp */
  timestamp: string;

  /** Message payload */
  payload: any;
}

/**
 * WebSocket connection state
 */
export interface WebSocketState {
  /** Whether connected to WebSocket server */
  connected: boolean;

  /** Connection error if any */
  error?: string;

  /** Reconnection attempt count */
  reconnectAttempts: number;

  /** Last message received */
  lastMessage?: WebSocketMessage;
}
