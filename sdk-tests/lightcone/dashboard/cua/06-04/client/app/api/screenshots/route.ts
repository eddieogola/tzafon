import { NextRequest, NextResponse } from 'next/server';
import { listScreenshots } from '@/lib/file-utils';
import { ApiResponse, Screenshot } from '@/lib/types';

/**
 * GET /api/screenshots
 * Lists available screenshots from ../expected/
 */
export async function GET(request: NextRequest) {
  try {
    const screenshots = await listScreenshots();

    if (screenshots.length === 0) {
      return NextResponse.json<ApiResponse<Screenshot[]>>(
        {
          success: true,
          data: [],
          message: 'No screenshots found',
        },
        { status: 200 }
      );
    }

    return NextResponse.json<ApiResponse<Screenshot[]>>(
      {
        success: true,
        data: screenshots,
        message: `Found ${screenshots.length} screenshots`,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch screenshots',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
