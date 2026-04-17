"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  TaskSummary,
  TaskResult,
  ResultsFilter,
  ApiResponse,
} from "@/lib/types";
import { parseMarkdownSummary } from "@/lib/utils";

/**
 * Hook for fetching and managing task results
 *
 * @param options - Configuration options
 * @returns Results state and methods
 *
 * @example
 * ```tsx
 * function ResultsPage() {
 *   const { results, loading, error, refresh } = useResults({
 *     autoRefresh: true,
 *     refreshInterval: 5000,
 *   });
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       {results.map(result => (
 *         <div key={result.taskId}>{result.summary?.instructionsFile}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useResults(options: {
  /** Automatically refresh results */
  autoRefresh?: boolean;
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
  /** Filter options */
  filter?: ResultsFilter;
  /** API base URL */
  apiBaseUrl?: string;
} = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 10000,
    filter,
    apiBaseUrl = "/api",
  } = options;

  const [results, setResults] = useState<TaskResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  /**
   * Fetch results from the API
   */
  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters from filter
      const params = new URLSearchParams();

      if (filter?.status) {
        const statuses = Array.isArray(filter.status)
          ? filter.status
          : [filter.status];
        statuses.forEach((s) => params.append("status", s));
      }

      if (filter?.dateFrom) params.append("dateFrom", filter.dateFrom);
      if (filter?.dateTo) params.append("dateTo", filter.dateTo);
      if (filter?.instructionsFile)
        params.append("instructionsFile", filter.instructionsFile);
      if (filter?.verificationStatus) {
        const statuses = Array.isArray(filter.verificationStatus)
          ? filter.verificationStatus
          : [filter.verificationStatus];
        statuses.forEach((s) => params.append("verificationStatus", s));
      }
      if (filter?.limit) params.append("limit", filter.limit.toString());
      if (filter?.offset) params.append("offset", filter.offset.toString());
      if (filter?.sortBy) params.append("sortBy", filter.sortBy);
      if (filter?.sortOrder) params.append("sortOrder", filter.sortOrder);

      const response = await fetch(
        `${apiBaseUrl}/results?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`);
      }

      const data: ApiResponse<TaskResult[]> = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch results");
      }

      setResults(data.data || []);
      setLastFetch(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, apiBaseUrl]);

  /**
   * Fetch a single result by task ID
   */
  const fetchResult = useCallback(
    async (taskId: string): Promise<TaskResult | null> => {
      try {
        const response = await fetch(`${apiBaseUrl}/results/${taskId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch result: ${response.statusText}`);
        }

        const data: ApiResponse<TaskResult> = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch result");
        }

        return data.data || null;
      } catch (err) {
        console.error("Error fetching result:", err);
        return null;
      }
    },
    [apiBaseUrl]
  );

  /**
   * Fetch summary markdown content and parse it
   */
  const fetchSummary = useCallback(
    async (summaryPath: string): Promise<TaskSummary | null> => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/summaries?path=${encodeURIComponent(summaryPath)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch summary: ${response.statusText}`);
        }

        const markdownContent = await response.text();
        return parseMarkdownSummary(markdownContent);
      } catch (err) {
        console.error("Error fetching summary:", err);
        return null;
      }
    },
    [apiBaseUrl]
  );

  /**
   * Refresh results manually
   */
  const refresh = useCallback(() => {
    fetchResults();
  }, [fetchResults]);

  // Initial fetch
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchResults();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchResults]);

  return {
    /** List of task results */
    results,
    /** Whether results are currently being loaded */
    loading,
    /** Error message if fetch failed */
    error,
    /** Timestamp of last successful fetch */
    lastFetch,
    /** Manually refresh results */
    refresh,
    /** Fetch a single result by task ID */
    fetchResult,
    /** Fetch and parse a summary markdown file */
    fetchSummary,
  };
}

/**
 * Hook for fetching a single result by task ID
 *
 * @param taskId - Task identifier
 * @param options - Configuration options
 * @returns Result state and methods
 *
 * @example
 * ```tsx
 * function ResultDetail({ taskId }: { taskId: string }) {
 *   const { result, loading, error } = useResult(taskId);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!result) return <div>Not found</div>;
 *
 *   return <div>{result.summary?.instructionsFile}</div>;
 * }
 * ```
 */
export function useResult(
  taskId: string,
  options: {
    /** API base URL */
    apiBaseUrl?: string;
    /** Auto-refresh interval (0 to disable) */
    refreshInterval?: number;
  } = {}
) {
  const { apiBaseUrl = "/api", refreshInterval = 0 } = options;

  const [result, setResult] = useState<TaskResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/results/${taskId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch result: ${response.statusText}`);
      }

      const data: ApiResponse<TaskResult> = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch result");
      }

      setResult(data.data || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error fetching result:", err);
    } finally {
      setLoading(false);
    }
  }, [taskId, apiBaseUrl]);

  // Initial fetch
  useEffect(() => {
    if (taskId) {
      fetchResult();
    }
  }, [taskId, fetchResult]);

  // Auto-refresh setup
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchResult();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchResult]);

  return {
    /** Task result */
    result,
    /** Whether result is currently being loaded */
    loading,
    /** Error message if fetch failed */
    error,
    /** Manually refresh the result */
    refresh: fetchResult,
  };
}

/**
 * Hook for filtering and sorting results locally
 *
 * @param results - Array of task results
 * @param filter - Filter options
 * @returns Filtered and sorted results
 *
 * @example
 * ```tsx
 * function FilteredResults() {
 *   const { results } = useResults();
 *   const [statusFilter, setStatusFilter] = useState<string[]>(['completed']);
 *
 *   const filtered = useResultsFilter(results, {
 *     status: statusFilter,
 *     sortBy: 'date',
 *     sortOrder: 'desc'
 *   });
 *
 *   return <div>{filtered.map(r => ...)}</div>;
 * }
 * ```
 */
export function useResultsFilter(
  results: TaskResult[],
  filter: ResultsFilter
): TaskResult[] {
  return useCallback(() => {
    let filtered = [...results];

    // Apply status filter
    if (filter.status) {
      const statuses = Array.isArray(filter.status)
        ? filter.status
        : [filter.status];
      filtered = filtered.filter((r) =>
        statuses.includes(r.summary?.taskStatus || r.status)
      );
    }

    // Apply date range filter
    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom);
      filtered = filtered.filter((r) => {
        const resultDate = r.summary?.date ? new Date(r.summary.date) : null;
        return resultDate && resultDate >= fromDate;
      });
    }

    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo);
      filtered = filtered.filter((r) => {
        const resultDate = r.summary?.date ? new Date(r.summary.date) : null;
        return resultDate && resultDate <= toDate;
      });
    }

    // Apply instructions file filter
    if (filter.instructionsFile) {
      const searchTerm = filter.instructionsFile.toLowerCase();
      filtered = filtered.filter((r) =>
        r.summary?.instructionsFile.toLowerCase().includes(searchTerm)
      );
    }

    // Apply verification status filter
    if (filter.verificationStatus) {
      const statuses = Array.isArray(filter.verificationStatus)
        ? filter.verificationStatus
        : [filter.verificationStatus];
      filtered = filtered.filter((r) =>
        statuses.includes(r.summary?.verificationResult?.status || "not_verified")
      );
    }

    // Apply sorting
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filter.sortBy) {
          case "date":
            aValue = a.summary?.date ? new Date(a.summary.date).getTime() : 0;
            bValue = b.summary?.date ? new Date(b.summary.date).getTime() : 0;
            break;
          case "status":
            aValue = a.summary?.taskStatus || a.status;
            bValue = b.summary?.taskStatus || b.status;
            break;
          case "events":
            aValue = a.eventCount || a.summary?.totalEvents || 0;
            bValue = b.eventCount || b.summary?.totalEvents || 0;
            break;
          default:
            return 0;
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return filter.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    // Apply limit and offset
    if (filter.offset !== undefined) {
      filtered = filtered.slice(filter.offset);
    }

    if (filter.limit !== undefined) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }, [results, filter])();
}
