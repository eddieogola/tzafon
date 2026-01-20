import { Computer } from "@tzafon/computer";
import dotenv from "dotenv";
import {
  checkModifierKeysShift,
  checkModifierKeysControl,
  checkModifierKeysAlt,
  checkMouseDownUp,
} from "@/auto/regressionTest";
import { checkBatchActions } from "./auto/newFeatures";
dotenv.config();

const client = new Computer({
  apiKey: process.env.TZAFON_API_KEY,
});

// Un-comment the test you want to run

/**
 * Task 1: Regression Testing
 */

// === 1.2 Low-Level Input Actions ===

// *** Test A: Modifier keys (Shift, Control, Alt) ***
// checkModifierKeysShift(client);
// checkModifierKeysControl(client);
// checkModifierKeysAlt(client);

// *** Test B: mouse_down / mouse_up ***
// checkMouseDownUp(client);

/**
 * Task 2: New Features - Computers API
 */

// 2.5 TypeScript SDK (@tzafon/computer)

// checkBatchActions(client);
