import { NextRequest, NextResponse } from 'next/server';
import {
  listLogFiles,
  readLogFile,
  getLogsPath,
  isPathSafe,
} from '@/lib/file-utils';
import { ApiResponse, LogEntry, LogContent } from '@/lib/types';
import path from 'path';

/**
 * GET /api/logs
 * Get recent agent logs with optional pagination
 *
 * Query parameters:
 * - file: specific log file to read (optional)
 * - page: page number for pagination (default: 1)
 * - limit: number of lines per page (default: 100, max: 1000)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('file');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '100', 10),
      1000
    );

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Invalid page number',
          message: 'Page number must be greater than 0',
        },
        { status: 400 }
      );
    }

    if (limit < 1) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Invalid limit',
          message: 'Limit must be greater than 0',
        },
        { status: 400 }
      );
    }

    // If filename is provided, return the content of that specific file
    if (filename) {
      // Security: validate filename to prevent directory traversal
      const logsPath = getLogsPath();
      const requestedPath = path.join(logsPath, filename);

      if (!isPathSafe(requestedPath, logsPath)) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Invalid file path',
            message: 'Access denied',
          },
          { status: 403 }
        );
      }

      const logContent = await readLogFile(filename, page, limit);

      if (!logContent) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Log file not found',
            message: `Could not read log file: ${filename}`,
          },
          { status: 404 }
        );
      }

      const response: LogContent = {
        filename,
        lines: logContent.lines,
        total: logContent.total,
        page,
        pageSize: limit,
        hasMore: logContent.hasMore,
      };

      return NextResponse.json<ApiResponse<LogContent>>(
        {
          success: true,
          data: response,
          message: `Retrieved ${logContent.lines.length} lines from ${filename}`,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    // If no filename is provided, return list of all log files
    const logs = await listLogFiles();

    if (logs.length === 0) {
      return NextResponse.json<ApiResponse<LogEntry[]>>(
        {
          success: true,
          data: [],
          message: 'No log files found',
        },
        { status: 200 }
      );
    }

    return NextResponse.json<ApiResponse<LogEntry[]>>(
      {
        success: true,
        data: logs,
        message: `Found ${logs.length} log files`,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
