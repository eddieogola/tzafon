import client from "@/core/client";
import { logger } from "@/core/telemetry";
import { ActionResult, ComputerExecuteActionParams } from "tzafon";

const executeAction = async (
  action: ComputerExecuteActionParams.Action
): Promise<ActionResult | null> => {
  const computer = await client.create({ kind: "browser" });

  logger.info(`Executing action ${action?.type}`);

  let actionResult: ActionResult | null = null;

  switch (action.type) {
    case "navigate":
      if (!action?.url) {
        throw new Error("URL is required");
      }
      actionResult = await computer.navigate(action?.url);
      break;

    default:
      break;
  }

  return actionResult;
};

export default executeAction;
