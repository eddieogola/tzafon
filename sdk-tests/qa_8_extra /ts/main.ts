import Computer from "@tzafon/computer";
import {
  shiftClickSelection,
  controlClickSelection,
  altClickSelection,
  checkKeyUpReleasesKey,
} from "./tasks/task-1-1.js";
import { drawLine } from "./tasks/task-1-2.js";
import { basicBatchExecution } from "./tasks/task-2-1.js";
import dotenv from "dotenv";
import { batchErrorHandling } from "./tasks/task-2-2.js";
import { keepAlive } from "./tasks/task-3-1.js";
import { eventStreaming } from "./tasks/task-3-2.js";
import { eventScreencast } from "./tasks/task-3-3.js";
import {
  mouseUp,
  mouseDown,
  keyDown,
  keyUp,
  changeProxy,
  webSocket,
} from "./tasks/task-4-2.js";

dotenv.config();

const client = new Computer({ apiKey: process.env.TZAFON_API_KEY });

/**
 * Task 1: Low-Level Input Actions
 */

/**
 * Task 1.1 Shift-click selection
 */

// shiftClickSelection(client);
// controlClickSelection(client);
// altClickSelection(client);
// checkKeyUpReleasesKey(client);

/**
 * Task 1.2 Fine-Grained Drag (mouse_down/mouse_up)
 */

// drawLine(client);

/**
 * Task 2: Batch Actions
 */

// basicBatchExecution(client);

/**
 * Task 2.2: Batch Error Handling
 */

// batchErrorHandling(client);

/**
 * Task 3: Streaming & Session Management [~60 min]
 */

/**
 * 3.1 Keep Alive
 */

// keepAlive(client);

/**
 * 3.2 Event Streaming (Optional/Advanced)
 */

// eventStreaming(client);

/**
 * 3.3 Event Screencast (Optional/Advanced)
 */

// eventScreencast(client);

/**
 * Task 4: Documentation Review
 */

/**
 * 4.2 Documentation Pages
 */

// Low-level Input Actions https://docs.tzafon.ai/core-concepts/actions#low-level-input-actions

// mouseUp(client);
// mouseDown(client);
// keyDown(client);
// keyUp(client);

// Change Proxy https://docs.tzafon.ai/core-concepts/actions#change-proxy-proxy-url
// changeProxy(client);

//WebSocket https://docs.tzafon.ai/core-concepts/streaming#connectwebsocket
// webSocket(client);
