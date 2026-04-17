import { promises as fs } from 'fs';
import path from 'path';
import { LogEntry, Screenshot } from './types';

/**
 * Gets the absolute path to the project root (one level up from dash-app)
 */
export function getProjectRoot(): string {
  return path.resolve(process.cwd(), '..');
}

/**
 * Gets the absolute path to the results directory
 */
export function getResultsPath(): string {
  return path.join(getProjectRoot(), 'results');
}

/**
 * Gets the absolute path to the expected directory
 */
export function getExpectedPath(): string {
  return path.join(getProjectRoot(), 'expected');
}

/**
 * Gets the absolute path to the logs directory
 */
export function getLogsPath(): string {
  return path.join(getProjectRoot(), 'logs');
}

/**
 * Safely reads a file with error handling
 */
export async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Lists all files in a directory with filtering
 */
export async function listFiles(
  dirPath: string,
  extension?: string
): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    if (extension) {
      return files.filter((file) => file.endsWith(extension));
    }
    return files;
  } catch (error) {
    console.error(`Error listing files in ${dirPath}:`, error);
    return [];
  }
}

/**
 * Gets file statistics
 */
export async function getFileStats(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    console.error(`Error getting stats for ${filePath}:`, error);
    return null;
  }
}

/**
 * Lists all verification result summaries
 */
export async function listResultSummaries(): Promise<string[]> {
  const resultsPath = getResultsPath();
  return listFiles(resultsPath, '_summary.md');
}

/**
 * Lists all screenshots
 */
export async function listScreenshots(): Promise<Screenshot[]> {
  const expectedPath = getExpectedPath();
  const files = await listFiles(expectedPath, '.png');

  const screenshots: Screenshot[] = [];

  for (const file of files) {
    const filePath = path.join(expectedPath, file);
    const stats = await getFileStats(filePath);

    if (stats) {
      screenshots.push({
        id: file.replace('.png', ''),
        filename: file,
        path: filePath,
        size: stats.size,
        created: stats.birthtime.toISOString(),
      });
    }
  }

  return screenshots.sort((a, b) => b.created.localeCompare(a.created));
}

/**
 * Lists all log files with metadata
 */
export async function listLogFiles(): Promise<LogEntry[]> {
  const logsPath = getLogsPath();
  const files = await listFiles(logsPath, '.log');

  const logs: LogEntry[] = [];

  for (const file of files) {
    const filePath = path.join(logsPath, file);
    const stats = await getFileStats(filePath);

    if (stats) {
      // Extract timestamp from filename (format: lightcone_agent_YYYYMMDD_HHMMSS.log)
      const timestampMatch = file.match(/(\d{8}_\d{6})/);
      const timestamp = timestampMatch
        ? parseTimestamp(timestampMatch[1])
        : stats.mtime.toISOString();

      logs.push({
        filename: file,
        timestamp,
        size: stats.size,
        path: filePath,
      });
    }
  }

  return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Parses timestamp from filename format (YYYYMMDD_HHMMSS)
 */
function parseTimestamp(timestamp: string): string {
  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hour = timestamp.substring(9, 11);
  const minute = timestamp.substring(11, 13);
  const second = timestamp.substring(13, 15);

  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

/**
 * Reads log file with pagination
 */
export async function readLogFile(
  filename: string,
  page: number = 1,
  pageSize: number = 100
): Promise<{ lines: string[]; total: number; hasMore: boolean } | null> {
  const logsPath = getLogsPath();
  const filePath = path.join(logsPath, filename);

  const content = await safeReadFile(filePath);
  if (!content) {
    return null;
  }

  const allLines = content.split('\n');
  const total = allLines.length;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const lines = allLines.slice(startIndex, endIndex);
  const hasMore = endIndex < total;

  return {
    lines,
    total,
    hasMore,
  };
}

/**
 * Validates that a path is within an allowed directory
 */
export function isPathSafe(filePath: string, allowedDir: string): boolean {
  const resolvedPath = path.resolve(filePath);
  const resolvedAllowedDir = path.resolve(allowedDir);
  return resolvedPath.startsWith(resolvedAllowedDir);
}
