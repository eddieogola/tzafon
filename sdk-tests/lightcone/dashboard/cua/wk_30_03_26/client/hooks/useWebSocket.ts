"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { WebSocketMessage, WebSocketState, AgentEvent } from "@/lib/types";

/**
 * Hook for managing WebSocket connections for real-time updates
 *
 * @param url - WebSocket server URL
 * @param options - Configuration options
 * @returns WebSocket state and methods
 *
 * @example
 * ```tsx
 * function LiveUpdates() {
 *   const { connected, lastMessage, error, send } = useWebSocket(
 *     'ws://localhost:3000/ws',
 *     {
 *       autoReconnect: true,
 *       onMessage: (message) => {
 *         console.log('Received:', message);
 *       },
 *     }
 *   );
 *
 *   return (
 *     <div>
 *       <div>Status: {connected ? 'Connected' : 'Disconnected'}</div>
 *       {error && <div>Error: {error}</div>}
 *       {lastMessage && <div>Last: {lastMessage.type}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocket(
  url: string,
  options: {
    /** Automatically reconnect on disconnect */
    autoReconnect?: boolean;
    /** Maximum reconnection attempts (0 = unlimited) */
    maxReconnectAttempts?: number;
    /** Delay between reconnection attempts in milliseconds */
    reconnectDelay?: number;
    /** Callback when a message is received */
    onMessage?: (message: WebSocketMessage) => void;
    /** Callback when connection opens */
    onOpen?: () => void;
    /** Callback when connection closes */
    onClose?: (event: CloseEvent) => void;
    /** Callback when an error occurs */
    onError?: (error: Event) => void;
    /** Enable debug logging */
    debug?: boolean;
  } = {}
) {
  const {
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 3000,
    onMessage,
    onOpen,
    onClose,
    onError,
    debug = false,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    connected: false,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);

  /**
   * Log debug messages
   */
  const log = useCallback(
    (...args: any[]) => {
      if (debug) {
        console.log("[WebSocket]", ...args);
      }
    },
    [debug]
  );

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log("Already connected");
      return;
    }

    try {
      log("Connecting to", url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        log("Connected");
        setState((prev) => ({
          ...prev,
          connected: true,
          error: undefined,
          reconnectAttempts: 0,
        }));
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          log("Message received:", message.type);

          setState((prev) => ({
            ...prev,
            lastMessage: message,
          }));

          onMessage?.(message);
        } catch (err) {
          log("Error parsing message:", err);
        }
      };

      ws.onclose = (event) => {
        log("Connection closed", event.code, event.reason);

        setState((prev) => ({
          ...prev,
          connected: false,
        }));

        onClose?.(event);

        // Attempt to reconnect
        if (
          shouldReconnectRef.current &&
          autoReconnect &&
          (maxReconnectAttempts === 0 ||
            state.reconnectAttempts < maxReconnectAttempts)
        ) {
          setState((prev) => ({
            ...prev,
            reconnectAttempts: prev.reconnectAttempts + 1,
          }));

          log(
            `Reconnecting in ${reconnectDelay}ms (attempt ${state.reconnectAttempts + 1}/${maxReconnectAttempts || "unlimited"})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (event) => {
        log("Error:", event);
        setState((prev) => ({
          ...prev,
          error: "WebSocket connection error",
        }));
        onError?.(event);
      };

      wsRef.current = ws;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      log("Connection error:", err);
      setState((prev) => ({
        ...prev,
        error: message,
      }));
    }
  }, [
    url,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    onMessage,
    onOpen,
    onClose,
    onError,
    state.reconnectAttempts,
    log,
  ]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    log("Disconnecting");
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      connected: false,
    }));
  }, [log]);

  /**
   * Send a message to the WebSocket server
   */
  const send = useCallback(
    (message: any) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        log("Cannot send message: not connected");
        return false;
      }

      try {
        const data = typeof message === "string" ? message : JSON.stringify(message);
        wsRef.current.send(data);
        log("Message sent:", data);
        return true;
      } catch (err) {
        log("Error sending message:", err);
        return false;
      }
    },
    [log]
  );

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    disconnect();
    shouldReconnectRef.current = true;
    setState((prev) => ({
      ...prev,
      reconnectAttempts: 0,
    }));
    connect();
  }, [connect, disconnect]);

  // Connect on mount
  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    /** Whether connected to WebSocket server */
    connected: state.connected,
    /** Connection error if any */
    error: state.error,
    /** Reconnection attempt count */
    reconnectAttempts: state.reconnectAttempts,
    /** Last message received */
    lastMessage: state.lastMessage,
    /** Send a message to the server */
    send,
    /** Manually reconnect */
    reconnect,
    /** Disconnect from the server */
    disconnect,
    /** Full WebSocket state */
    state,
  };
}

/**
 * Hook for subscribing to specific WebSocket message types
 *
 * @param url - WebSocket server URL
 * @param messageType - Message type to subscribe to
 * @param handler - Handler function for messages of this type
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function TaskProgress({ taskId }: { taskId: string }) {
 *   const [progress, setProgress] = useState(0);
 *
 *   useWebSocketSubscription(
 *     'ws://localhost:3000/ws',
 *     'task_progress',
 *     (message) => {
 *       if (message.taskId === taskId) {
 *         setProgress(message.payload.progress);
 *       }
 *     }
 *   );
 *
 *   return <div>Progress: {progress}%</div>;
 * }
 * ```
 */
export function useWebSocketSubscription(
  url: string,
  messageType: WebSocketMessage["type"] | WebSocketMessage["type"][],
  handler: (message: WebSocketMessage) => void,
  options: {
    autoReconnect?: boolean;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    debug?: boolean;
  } = {}
) {
  const types = Array.isArray(messageType) ? messageType : [messageType];

  const onMessage = useCallback(
    (message: WebSocketMessage) => {
      if (types.includes(message.type)) {
        handler(message);
      }
    },
    [types, handler]
  );

  return useWebSocket(url, {
    ...options,
    onMessage,
  });
}

/**
 * Hook for tracking live task events via WebSocket
 *
 * @param url - WebSocket server URL
 * @param taskId - Task identifier to track (optional)
 * @returns Events state and methods
 *
 * @example
 * ```tsx
 * function LiveTaskView({ taskId }: { taskId: string }) {
 *   const { events, status, connected } = useLiveTaskEvents(
 *     'ws://localhost:3000/ws',
 *     taskId
 *   );
 *
 *   return (
 *     <div>
 *       <div>Status: {status}</div>
 *       <div>Events: {events.length}</div>
 *       {events.map((event, i) => (
 *         <div key={i}>{event.type}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLiveTaskEvents(url: string, taskId?: string) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<
    "idle" | "started" | "running" | "completed" | "failed"
  >("idle");

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      // Filter by taskId if specified
      if (taskId && message.taskId !== taskId) {
        return;
      }

      switch (message.type) {
        case "task_started":
          setStatus("started");
          setEvents([]);
          break;

        case "task_progress":
          setStatus("running");
          break;

        case "task_completed":
          setStatus("completed");
          break;

        case "task_failed":
          setStatus("failed");
          break;

        case "event":
          // Add event to the list
          const newEvent: AgentEvent = {
            eventNumber: events.length + 1,
            timestamp: message.timestamp,
            type: message.payload?.type,
            data: message.payload || {},
            rawEvent: JSON.stringify(message.payload),
          };
          setEvents((prev) => [...prev, newEvent]);
          break;
      }
    },
    [taskId, events.length]
  );

  const ws = useWebSocket(url, {
    autoReconnect: true,
    onMessage: handleMessage,
  });

  /**
   * Clear all events
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
    setStatus("idle");
  }, []);

  return {
    /** List of events received */
    events,
    /** Current task status */
    status,
    /** WebSocket connection state */
    connected: ws.connected,
    /** Connection error if any */
    error: ws.error,
    /** Clear all events */
    clearEvents,
    /** Manually reconnect */
    reconnect: ws.reconnect,
  };
}

/**
 * Hook for simple WebSocket event listening
 *
 * @param url - WebSocket server URL
 * @param options - Configuration options
 * @returns Latest event and connection state
 *
 * @example
 * ```tsx
 * function EventMonitor() {
 *   const { event, connected } = useWebSocketEvent('ws://localhost:3000/ws');
 *
 *   return (
 *     <div>
 *       {connected && <div>Connected</div>}
 *       {event && <pre>{JSON.stringify(event, null, 2)}</pre>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocketEvent(
  url: string,
  options: {
    autoReconnect?: boolean;
    debug?: boolean;
  } = {}
) {
  const [event, setEvent] = useState<WebSocketMessage | null>(null);

  const ws = useWebSocket(url, {
    ...options,
    onMessage: setEvent,
  });

  return {
    /** Latest event received */
    event,
    /** WebSocket connection state */
    connected: ws.connected,
    /** Connection error if any */
    error: ws.error,
    /** Manually reconnect */
    reconnect: ws.reconnect,
  };
}
