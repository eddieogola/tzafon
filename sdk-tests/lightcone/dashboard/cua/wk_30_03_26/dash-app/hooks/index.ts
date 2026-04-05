/**
 * Custom React hooks for Lightcone Dashboard
 *
 * This module exports all custom hooks for managing task results,
 * WebSocket connections, and real-time updates.
 */

export {
  useResults,
  useResult,
  useResultsFilter,
} from "./useResults";

export {
  useWebSocket,
  useWebSocketSubscription,
  useLiveTaskEvents,
  useWebSocketEvent,
} from "./useWebSocket";
