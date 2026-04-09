import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  TaskSummary,
  TaskStep,
  VerificationResult,
  ScreenshotComparison,
  AgentEvent,
} from "./types";

/**
 * Utility function for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse markdown summary file and extract structured data
 *
 * @param markdownContent - Raw markdown content from summary file
 * @returns Parsed TaskSummary object
 *
 * @example
 * ```ts
 * const summary = parseMarkdownSummary(markdownContent);
 * console.log(summary.taskStatus); // 'completed'
 * console.log(summary.taskSteps); // Array of task steps
 * ```
 */
export function parseMarkdownSummary(markdownContent: string): TaskSummary {
  const lines = markdownContent.split("\n");

  // Initialize the summary object
  const summary: Partial<TaskSummary> = {
    date: "",
    instructionsFile: "",
    completionMessage: "",
    totalEvents: 0,
    taskStatus: "completed",
    taskSteps: [],
    rawContent: markdownContent,
  };

  // Parse metadata from the header
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim();

    if (line.startsWith("**Date:**")) {
      summary.date = line.replace("**Date:**", "").trim();
    } else if (line.startsWith("**Instructions File:**")) {
      summary.instructionsFile = line.replace("**Instructions File:**", "").trim();
    } else if (line.startsWith("**Expected Screenshot:**")) {
      const screenshot = line.replace("**Expected Screenshot:**", "").trim();
      if (screenshot && screenshot !== "N/A") {
        summary.expectedScreenshot = screenshot;
      }
    } else if (line.startsWith("- **Total Events:**")) {
      const eventsStr = line.replace("- **Total Events:**", "").trim();
      summary.totalEvents = parseInt(eventsStr, 10) || 0;
    } else if (line.startsWith("- **Task Status:**")) {
      const status = line
        .replace("- **Task Status:**", "")
        .trim()
        .toLowerCase();
      summary.taskStatus = status as TaskSummary["taskStatus"];
    }
  }

  // Extract completion message (everything between ## Completion Message and next ##)
  const completionStart = markdownContent.indexOf("## Completion Message");
  const completionEnd = markdownContent.indexOf(
    "## Event Statistics",
    completionStart
  );

  if (completionStart !== -1 && completionEnd !== -1) {
    summary.completionMessage = markdownContent
      .substring(completionStart, completionEnd)
      .replace("## Completion Message", "")
      .trim();
  }

  // Extract task steps
  summary.taskSteps = extractTaskSteps(markdownContent);

  // Extract screenshot comparison
  summary.screenshotComparison = parseScreenshotComparison(markdownContent);

  // Extract verification result
  summary.verificationResult = getVerificationStatus(markdownContent);

  return summary as TaskSummary;
}

/**
 * Extract task steps from markdown content
 *
 * @param markdownContent - Raw markdown content
 * @returns Array of TaskStep objects
 *
 * @example
 * ```ts
 * const steps = extractTaskSteps(markdownContent);
 * steps.forEach(step => {
 *   console.log(`${step.completed ? '✓' : '✗'} ${step.description}`);
 * });
 * ```
 */
export function extractTaskSteps(markdownContent: string): TaskStep[] {
  const steps: TaskStep[] = [];
  const lines = markdownContent.split("\n");

  let order = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match checkbox patterns: - [x] or - [ ]
    const checkboxMatch = trimmed.match(/^-\s*\[([x ])\]\s*(.+)$/i);

    if (checkboxMatch) {
      const completed = checkboxMatch[1].toLowerCase() === "x";
      const description = checkboxMatch[2].trim();

      steps.push({
        description,
        completed,
        order: order++,
      });
    }
  }

  return steps;
}

/**
 * Parse screenshot comparison section from markdown
 *
 * @param markdownContent - Raw markdown content
 * @returns ScreenshotComparison object or undefined
 */
export function parseScreenshotComparison(
  markdownContent: string
): ScreenshotComparison | undefined {
  const comparisonStart = markdownContent.indexOf("**Screenshot Comparison:**");

  if (comparisonStart === -1) {
    return undefined;
  }

  // Extract the comparison section
  const comparisonEnd = markdownContent.indexOf("**Status:**", comparisonStart);
  const rawComparison = markdownContent
    .substring(
      comparisonStart,
      comparisonEnd !== -1 ? comparisonEnd : undefined
    )
    .replace("**Screenshot Comparison:**", "")
    .trim();

  // Parse structured data from the comparison
  const comparison: ScreenshotComparison = {
    mainSections: [],
    selectedOptions: {},
    notableElements: [],
    rawComparison,
  };

  // Extract page title
  const titleMatch = rawComparison.match(/\*\*Page Title:\*\*\s*"([^"]+)"/);
  if (titleMatch) {
    comparison.pageTitle = titleMatch[1];
  }

  // Extract URL
  const urlMatch = rawComparison.match(/lightcone\.ai\/[^\s)]+/);
  if (urlMatch) {
    comparison.url = urlMatch[0];
  }

  // Extract main sections (numbered lists)
  const sectionMatches = rawComparison.match(/\d+\.\s+\*\*([^:]+):/g);
  if (sectionMatches) {
    comparison.mainSections = sectionMatches.map((match) =>
      match.replace(/\d+\.\s+\*\*/, "").replace(":", "").trim()
    );
  }

  // Extract selected options
  const selectedMatch = rawComparison.match(
    /\*\*Selected Options:\*\*\s*([\s\S]*?)(?=\*\*|\n\n|$)/
  );
  if (selectedMatch) {
    const options = selectedMatch[1];
    const optionLines = options.split("\n").filter((l) => l.includes(":"));

    for (const line of optionLines) {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      if (key && value) {
        comparison.selectedOptions[key.trim().replace(/^-\s*/, "")] = value;
      }
    }
  }

  return comparison;
}

/**
 * Extract verification status from summary markdown
 *
 * @param markdownContent - Raw markdown content
 * @returns VerificationResult object
 *
 * @example
 * ```ts
 * const result = getVerificationStatus(markdownContent);
 * if (result.status === 'passed') {
 *   console.log('Verification passed!');
 * }
 * ```
 */
export function getVerificationStatus(
  markdownContent: string
): VerificationResult {
  const result: VerificationResult = {
    status: "not_verified",
    statusMessage: "No verification performed",
    timestamp: new Date().toISOString(),
    expectedScreenshotAccessible: false,
  };

  // Look for status indicators
  if (markdownContent.includes("**Status:** ✅ Verification PASSED")) {
    result.status = "passed";
    result.statusMessage = "Verification passed successfully";
    result.expectedScreenshotAccessible = true;
  } else if (
    markdownContent.includes("**Status:** ❌ Verification FAILED") ||
    markdownContent.includes("**Status:** ❌ Verification FAILED or Inconclusive")
  ) {
    result.status = "failed";
    result.statusMessage = "Verification failed or inconclusive";
    result.expectedScreenshotAccessible = true;
  } else if (
    markdownContent.includes(
      "**Status:** ⚠️ Could not verify - Expected screenshot not accessible"
    )
  ) {
    result.status = "inconclusive";
    result.statusMessage = "Could not verify - expected screenshot not accessible";
    result.expectedScreenshotAccessible = false;
  } else if (markdownContent.includes("**Screenshot Comparison:**")) {
    result.status = "inconclusive";
    result.statusMessage = "Verification completed but result unclear";
    result.expectedScreenshotAccessible = true;
  }

  // Extract details from the content
  const detailsMatch = markdownContent.match(
    /### Screenshot Verification\s*([\s\S]*?)(?=\*\*Status:|$)/
  );
  if (detailsMatch) {
    result.details = detailsMatch[1].trim().substring(0, 500); // Limit to 500 chars
  }

  return result;
}

/**
 * Format timestamp to human-readable format
 *
 * @param timestamp - ISO timestamp string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatTimestamp('2026-04-05T19:57:47') // 'Apr 5, 2026 at 7:57 PM'
 * formatTimestamp(new Date(), { relative: true }) // 'just now' or '2 hours ago'
 * ```
 */
export function formatTimestamp(
  timestamp: string | Date,
  options: {
    relative?: boolean;
    includeTime?: boolean;
    format?: "short" | "long" | "full";
  } = {}
): string {
  const {
    relative = false,
    includeTime = true,
    format = "long",
  } = options;

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Relative time formatting
  if (relative) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    if (diffDay < 30)
      return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? "s" : ""} ago`;
    if (diffDay < 365)
      return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) > 1 ? "s" : ""} ago`;
  }

  // Absolute time formatting
  const dateOptions: Intl.DateTimeFormatOptions = {};

  if (format === "short") {
    dateOptions.month = "short";
    dateOptions.day = "numeric";
    if (includeTime) {
      dateOptions.hour = "numeric";
      dateOptions.minute = "2-digit";
    }
  } else if (format === "long") {
    dateOptions.month = "short";
    dateOptions.day = "numeric";
    dateOptions.year = "numeric";
    if (includeTime) {
      dateOptions.hour = "numeric";
      dateOptions.minute = "2-digit";
    }
  } else if (format === "full") {
    dateOptions.weekday = "long";
    dateOptions.month = "long";
    dateOptions.day = "numeric";
    dateOptions.year = "numeric";
    if (includeTime) {
      dateOptions.hour = "numeric";
      dateOptions.minute = "2-digit";
      dateOptions.second = "2-digit";
    }
  }

  return new Intl.DateTimeFormat("en-US", dateOptions).format(date);
}

/**
 * Parse agent events from event history JSON
 *
 * @param eventsData - Raw events data from JSON
 * @returns Array of AgentEvent objects
 */
export function parseAgentEvents(eventsData: any[]): AgentEvent[] {
  if (!Array.isArray(eventsData)) {
    return [];
  }

  return eventsData.map((event, index) => ({
    eventNumber: event.event_number || index + 1,
    timestamp: event.timestamp || new Date().toISOString(),
    type: event.type,
    data: event,
    rawEvent: event.raw_event || JSON.stringify(event),
  }));
}

/**
 * Calculate task duration from events
 *
 * @param events - Array of agent events
 * @returns Duration in milliseconds
 */
export function calculateTaskDuration(events: AgentEvent[]): number {
  if (events.length < 2) return 0;

  const firstEvent = new Date(events[0].timestamp);
  const lastEvent = new Date(events[events.length - 1].timestamp);

  return lastEvent.getTime() - firstEvent.getTime();
}

/**
 * Format duration in a human-readable way
 *
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 *
 * @example
 * ```ts
 * formatDuration(125000) // '2m 5s'
 * formatDuration(3665000) // '1h 1m 5s'
 * ```
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const s = seconds % 60;
  const m = minutes % 60;
  const h = hours;

  const parts: string[] = [];

  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.join(" ");
}

/**
 * Get status badge color based on verification status
 *
 * @param status - Verification status
 * @returns Tailwind color class
 */
export function getStatusColor(
  status: VerificationResult["status"] | TaskSummary["taskStatus"]
): string {
  const colorMap: Record<string, string> = {
    passed: "green",
    completed: "green",
    failed: "red",
    inconclusive: "yellow",
    not_verified: "gray",
    interrupted: "orange",
    running: "blue",
  };

  return colorMap[status] || "gray";
}

/**
 * Truncate text to a maximum length
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append (default: '...')
 * @returns Truncated text
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix = "..."
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}
