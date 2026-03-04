import type { ComputerSession } from "@tzafon/computer";
import type { ActionResult } from "@tzafon/computer";

export const handleScreenshotResult = (
  computer: ComputerSession,
  result: ActionResult,
) => {
  if (result.status?.toLowerCase() == "success") {
    console.log(`Screenshot: ${result.result?.screenshot_url}`);
  } else {
    console.log("-".repeat(20));
    console.log("Screenshot failed");
    console.log("Computer ID:", computer.id);
    console.log("Status:", result.status);
    console.log("Error Message:", result.error_message);
    console.log("Timestamp:", result.timestamp);
    console.log("-".repeat(20));
  }
};

export const handleBatchResult = (
  computer: ComputerSession,
  result: ActionResult,
) => {
  for (const action of result.results) {
    if (action.status?.toLowerCase() == "success") {
      console.log(`Action: ${JSON.stringify(action)}`);
    } else {
      console.log("-".repeat(20));
      console.log("Action failed");
      console.log("Computer ID:", computer.id);
      console.log("Status:", action.status);
      console.log("Error Message:", action.error_message);
      console.log("Timestamp:", action.timestamp);
      console.log("-".repeat(20));
    }
  }
};
