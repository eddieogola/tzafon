import client from "@/core/client";
import { logger } from "@/core/telemetry";
import { ActionResult, ComputerExecuteActionParams } from "tzafon";

interface ExecuteActionParams extends ComputerExecuteActionParams {}
// Action Types: navigate|click|double_click|right_click|drag|type|keypress|scroll|wait|screenshot|go_to_url|debug|get_html_content|set_viewport|list_tabs|new_tab|switch_tab|close_tab

interface ExecuteActionResponse extends ActionResult {
  status: "success" | "error";
  message: string | null;
  data: ActionResult | null;
}

const executeAction = async ({
  action,
}: ExecuteActionParams): Promise<ExecuteActionResponse> => {
  const computer = await client.create({ kind: "browser" });

  logger.info(`Executing action ${action?.type}`);

  let actionResult: ActionResult | null = null;
  let response: ExecuteActionResponse;

  switch (action?.type) {
    case "navigate":
      if (!action?.url) {
        response = {
          status: "error",
          message: "URL is required",
          data: null,
        };
      } else {
        actionResult = await computer.navigate(action?.url);
        response = {
          status: "success",
          message: null,
          data: actionResult,
        };
      }
      break;
    case "click":
      if (!action?.x || !action?.y) {
        response = {
          status: "error",
          message: "X and Y coordinates are required",
          data: null,
        };
      } else {
        actionResult = await computer.click(action.x, action.y);
        response = {
          status: "success",
          message: null,
          data: actionResult,
        };
      }
      break;
    case "double_click":
      if (!action?.x || !action?.y) {
        response = {
          status: "error",
          message: "X and Y coordinates are required",
          data: null,
        };
      } else {
        actionResult = await computer.doubleClick(action.x, action.y);
        response = {
          status: "success",
          message: null,
          data: actionResult,
        };
      }
      break;
    case "right_click":
      if (!action?.x || !action?.y) {
        response = {
          status: "error",
          message: "X and Y coordinates are required",
          data: null,
        };
      } else {
        actionResult = await computer.rightClick(action.x, action.y);
        response = {
          status: "success",
          message: null,
          data: actionResult,
        };
      }
      break;
    case "drag":
      if (!action?.x1 || !action?.y1 || !action?.x2 || !action?.y2) {
        response = {
          status: "error",
          message: "X1, Y1, X2, and Y2 coordinates are required",
          data: null,
        };
      } else {
        actionResult = await computer.drag(
          action.x1,
          action.y1,
          action.x2,
          action.y2
        );
        response = {
          status: "success",
          message: null,
          data: actionResult,
        };
      }
      break;
    case "type":
      if (!action?.text) {
        response = {
          status: "error",
          message: "Text is required",
          data: null,
        };
      } else {
        actionResult = await computer.type(action.text);
        response = {
          status: "success",
          message: null,
          data: actionResult,
        };
      }
      break;

    case "scroll":
      if (!action?.dx || !action?.dy) {
        response = {
          status: "error",
          message: "dx and dy are required",
          data: null,
        };
      } else {
        actionResult = await computer.scroll(action.dx, action.dy);
        response = {
          status: "success",
          message: null,
          data: actionResult,
        };
      }
      break;
    case "screenshot":
      actionResult = await computer.screenshot();
      response = {
        status: "success",
        message: null,
        data: actionResult,
      };

      break;
    case "get_html_content":
      actionResult = await computer.getHTML();
      response = {
        status: "success",
        message: null,
        data: actionResult,
      };
      break;
    default:
      response = {
        status: "error",
        message: `Unsupported action type: ${action?.type}`,
        data: null,
      };
      break;
  }

  return response;
};

export default executeAction;
