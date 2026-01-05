import client, { getActiveComputerId } from "@/core/client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
const getServer = async () => {
  const server = new McpServer(
    {
      name: "tzafon",
      version: "1.0.0",
      websiteUrl: "https://tzafon.ai",
    },
    {
      capabilities: {
        logging: {},
        tools: {
          listChanged: true,
        },
      },
    }
  );

  server.registerTool(
    "navigate",
    {
      title: "Navigate",
      description: "Navigate to a URL",
      inputSchema: {
        url: z.string().describe("URL to navigate to"),
      },
    },
    async ({ url }): Promise<CallToolResult> => {
      const computerId = await getActiveComputerId();

      try {
        await client.computers.navigate(computerId, {
          url,
        });
        return {
          content: [{ type: "text", text: "Navigated to " + url }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Navigation failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "take_screenshot",
    {
      title: "Take Screenshot",
      description: "Take a screenshot of the current page",
      inputSchema: {},
    },
    async (): Promise<CallToolResult> => {
      const computerId = await getActiveComputerId();
      try {
        const screenshot = await client.computers.captureScreenshot(computerId);
        const screenshotUrl = screenshot.result?.screenshot_url;
        return {
          content: [
            { type: "text", text: "Screenshot taken " + screenshotUrl },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Screenshot failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "scroll",
    {
      title: "Scroll",
      description: "Scroll to a specific position on the page",
      inputSchema: {
        dx: z
          .number()
          .describe(
            "Horizontal scroll delta (positive = right, negative = left) of the viewport (0-" +
              VIEWPORT_WIDTH +
              ")"
          ),
        dy: z
          .number()
          .describe(
            "Vertical scroll delta (positive = down, negative = up) of the viewport (0-" +
              VIEWPORT_HEIGHT +
              ")"
          ),
      },
    },
    async ({ dx, dy }) => {
      const computerId = await getActiveComputerId();
      try {
        await client.computers.setViewport(computerId, {
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
        });
        await client.computers.scrollViewport(computerId, {
          dx,
          dy,
        });
        return {
          content: [{ type: "text", text: "Scrolled to " + dx + ", " + dy }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Scroll failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "type",
    {
      title: "Type",
      description: "Type a specific text on the page",
      inputSchema: {
        text: z.string().describe("Text to type"),
      },
    },
    async ({ text }): Promise<CallToolResult> => {
      const computerId = await getActiveComputerId();
      try {
        await client.computers.typeText(computerId, {
          text,
        });
        return {
          content: [{ type: "text", text: "Typed " + text }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Type failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "hotkey",
    {
      title: "Hotkey",
      description: "Press a specific hotkey on the page",
      inputSchema: {
        hotkeys: z
          .array(z.string())
          .describe(
            "Hotkeys to press e.g. ['enter'], ['ctrl', 'c'], ['alt', 'f4']"
          ),
      },
    },
    async ({ hotkeys }): Promise<CallToolResult> => {
      const computerId = await getActiveComputerId();
      try {
        await client.computers.pressHotkey(computerId, {
          keys: hotkeys,
        });
        return {
          content: [{ type: "text", text: "Pressed " + hotkeys.join(", ") }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Press failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "click",
    {
      title: "Click",
      description: "Click a specific element on the page",
      inputSchema: {
        x: z
          .number()
          .describe("X coordinate of the viewport (0-" + VIEWPORT_WIDTH + ")"),
        y: z
          .number()
          .describe("Y coordinate of the viewport (0-" + VIEWPORT_HEIGHT + ")"),
      },
    },
    async ({ x, y }): Promise<CallToolResult> => {
      const computerId = await getActiveComputerId();
      try {
        await client.computers.setViewport(computerId, {
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
        });
        await client.computers.click(computerId, {
          x,
          y,
        });
        return {
          content: [{ type: "text", text: "Clicked at " + x + ", " + y }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Click failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "getHTML",
    {
      title: "Get HTML",
      description: "Get the HTML of the current page",
      inputSchema: {},
    },
    async (): Promise<CallToolResult> => {
      const computerId = await getActiveComputerId();
      try {
        const result = await client.computers.getHTML(computerId);
        const html = result.result?.html_content;

        if (!Boolean(html)) {
          return {
            content: [{ type: "text", text: "Get HTML failed" }],
            isError: true,
          };
        } else
          return {
            content: [{ type: "text", text: html as string }],
          };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Get HTML failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "wait",
    {
      title: "Wait",
      description: "Wait for a specific amount of time",
      inputSchema: {
        seconds: z
          .number()
          .describe(
            "Seconds to wait for page to load or update user interface usually 2 seconds is enough"
          ),
      },
    },
    async ({ seconds }): Promise<CallToolResult> => {
      const computerId = await getActiveComputerId();
      try {
        await client.computers.executeAction(computerId, {
          action: { type: "wait", ms: seconds * 1000 },
        });
        return {
          content: [
            { type: "text", text: "Waited for " + seconds + " seconds" },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Wait failed" }],
          isError: true,
        };
      }
    }
  );

  // server.registerTool(
  //   "execute_action",
  //   {
  //     title: "Execute Action",
  //     description: "Execute an action on a Tzafon client",
  //     inputSchema: {
  //       action: z.object({
  //         type: z.enum(["screenshot", "click", "wait"]),
  //         url: z.string().optional().describe("URL to navigate to"),
  //         x: z
  //           .number()
  //           .optional()
  //           .describe(
  //             "X coordinate of the viewport (0-" + VIEWPORT_WIDTH + ")"
  //           ),
  //         y: z
  //           .number()
  //           .optional()
  //           .describe(
  //             "Y coordinate of the viewport (0-" + VIEWPORT_HEIGHT + ")"
  //           ),
  //         seconds: z
  //           .number()
  //           .optional()
  //           .describe(
  //             "Seconds to wait for page to load usually 2 seconds is enough, used with the wait action type"
  //           ),
  //       }),
  //     },
  //   },
  //   async ({ action }): Promise<CallToolResult> => {
  //     const computerId = await getActiveComputerId();
  //     const result = await executeAction({ computerId, action });

  //     if (result.status === "success") {
  //       switch (action.type) {
  //         case "screenshot":
  //           return {
  //             content: [
  //               {
  //                 type: "text",
  //                 text:
  //                   "Screenshot taken " + result.data?.result?.screenshot_url,
  //               },
  //             ],
  //           };
  //         case "click":
  //           return {
  //             content: [
  //               {
  //                 type: "text",
  //                 text: "Clicked at " + action.x + ", " + action.y,
  //               },
  //             ],
  //           };
  //         case "wait":
  //           return {
  //             content: [
  //               {
  //                 type: "text",
  //                 text: "Waited for " + action.seconds + " seconds",
  //               },
  //             ],
  //           };
  //       }
  //     } else {
  //       return {
  //         content: [{ type: "text", text: result.message || "Action failed" }],
  //         isError: true,
  //       };
  //     }
  //   }
  // );

  return server;
};

export default getServer;
