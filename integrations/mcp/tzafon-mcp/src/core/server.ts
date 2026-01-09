import client, {
  getActiveComputerId,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from "@/core/client";
import { recordActivity } from "@/core/keepAlive";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

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
      await recordActivity();
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
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        const screenshot = await client.computers.captureScreenshot(computerId);
        const screenshotUrl = screenshot.result?.screenshot_url;

        if (!screenshotUrl || typeof screenshotUrl !== "string") {
          return {
            content: [
              { type: "text", text: "Screenshot failed: No URL returned" },
            ],
            isError: true,
          };
        }

        // Fetch the screenshot and convert to base64
        const response = await fetch(screenshotUrl as string);
        if (!response.ok) {
          return {
            content: [
              {
                type: "text",
                text: "Screenshot failed: Could not fetch image",
              },
            ],
            isError: true,
          };
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        // Determine media type from content-type header or default to png
        const contentType = response.headers.get("content-type") || "image/png";

        return {
          content: [
            {
              type: "image",
              data: base64Data,
              mimeType: contentType,
            },
            {
              type: "text",
              text: "Screenshot URL: " + screenshotUrl,
            },
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
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
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
      await recordActivity();
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
      await recordActivity();
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
      description:
        "Click a specific element on the page, using coordinates relative to the viewport (0-" +
        VIEWPORT_WIDTH +
        ") pixels and (0-" +
        VIEWPORT_HEIGHT +
        ") pixels",
      inputSchema: {
        x: z
          .number()
          .describe(
            "X coordinate of the viewport (0-" + VIEWPORT_WIDTH + ") pixels"
          ),
        y: z
          .number()
          .describe(
            "Y coordinate of the viewport (0-" + VIEWPORT_HEIGHT + ") pixels"
          ),
      },
    },
    async ({ x, y }): Promise<CallToolResult> => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
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
      await recordActivity();
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
      await recordActivity();
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

  server.registerTool(
    "right_click",
    {
      title: "Right Click",
      description: "Right click on a specific element on the page",
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
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        await client.computers.rightClick(computerId, {
          x,
          y,
        });
        return {
          content: [{ type: "text", text: "Right clicked at " + x + ", " + y }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Right click failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "double_click",
    {
      title: "Double Click",
      description: "Double click on a specific element on the page",
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
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        await client.computers.doubleClick(computerId, {
          x,
          y,
        });
        return {
          content: [
            { type: "text", text: "Double clicked at " + x + ", " + y },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Double click failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "drag",
    {
      title: "Drag",
      description: "Drag an element on the page",
      inputSchema: {
        x1: z
          .number()
          .describe(
            "X1 coordinate of the viewport (0-" +
              VIEWPORT_WIDTH +
              ") to drag from"
          ),
        y1: z
          .number()
          .describe(
            "Y1 coordinate of the viewport (0-" +
              VIEWPORT_HEIGHT +
              ") to drag from"
          ),
        x2: z
          .number()
          .describe(
            "X2 coordinate of the viewport (0-" +
              VIEWPORT_WIDTH +
              ") to drag to"
          ),
        y2: z
          .number()
          .describe(
            "Y2 coordinate of the viewport (0-" +
              VIEWPORT_HEIGHT +
              ") to drag to"
          ),
      },
    },
    async ({ x1, y1, x2, y2 }): Promise<CallToolResult> => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        await client.computers.drag(computerId, {
          x1,
          y1,
          x2,
          y2,
        });
        return {
          content: [
            {
              type: "text",
              text: "Dragged at " + x1 + ", " + y1 + " to " + x2 + ", " + y2,
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Drag failed" }],
          isError: true,
        };
      }
    }
  );

  return server;
};

export default getServer;
