import Computer from "tzafon";
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

eventStreaming(client);
