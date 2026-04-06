import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import {
  listResultSummaries,
  safeReadFile,
  getResultsPath,
  isPathSafe,
} from '@/lib/file-utils';
import { parseVerificationSummary } from '@/lib/markdown-parser';
import { ApiResponse, VerificationSummary } from '@/lib/types';

/**
 * GET /api/results
 * Lists all verification summaries from ../results/
 *
 * Query parameters:
 * - id: specific result ID to retrieve (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resultId = searchParams.get('id');

    // If ID is provided, return that specific result
    if (resultId) {
      const resultsPath = getResultsPath();
      const filename = `${resultId}_summary.md`;
      const filePath = path.join(resultsPath, filename);

      // Security: validate file path
      if (!isPathSafe(filePath, resultsPath)) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Invalid file path',
            message: 'Access denied',
          },
          { status: 403 }
        );
      }

      const content = await safeReadFile(filePath);

      if (!content) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Result not found',
            message: `Could not find result with ID: ${resultId}`,
          },
          { status: 404 }
        );
      }

      const summary = parseVerificationSummary(content, filename);

      return NextResponse.json<ApiResponse<VerificationSummary>>(
        {
          success: true,
          data: summary,
          message: `Retrieved result: ${resultId}`,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    // Otherwise, list all results
    const summaryFiles = await listResultSummaries();

    if (summaryFiles.length === 0) {
      return NextResponse.json<ApiResponse<VerificationSummary[]>>(
        {
          success: true,
          data: [],
          message: 'No verification summaries found',
        },
        { status: 200 }
      );
    }

    const resultsPath = getResultsPath();
    const summaries: VerificationSummary[] = [];

    for (const file of summaryFiles) {
      const filePath = path.join(resultsPath, file);
      const content = await safeReadFile(filePath);

      if (content) {
        const summary = parseVerificationSummary(content, file);
        summaries.push(summary);
      }
    }

    // Sort by date (most recent first)
    summaries.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json<ApiResponse<VerificationSummary[]>>(
      {
        success: true,
        data: summaries,
        message: `Found ${summaries.length} verification summaries`,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch verification summaries',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
