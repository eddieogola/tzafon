import client, { getActiveComputerId } from "@/core/client";
import { recordActivity } from "@/core/keepAlive";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";

// Grid system for normalized coordinates (0-999)
const GRID_SIZE = 1000;

/**
 * Converts normalized grid coordinates (0-999) to actual viewport pixel coordinates.
 * This allows LLMs to think in percentages (e.g., 500 = 50% = center) rather than exact pixels.
 * @param gridX - X coordinate in 0-999 range
 * @param gridY - Y coordinate in 0-999 range
 * @returns Object containing the actual viewport pixel coordinates
 */
const gridToViewport = (
  gridX: number,
  gridY: number,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } => {
  // Clamp values to valid range
  const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, gridX));
  const clampedY = Math.max(0, Math.min(GRID_SIZE - 1, gridY));

  // Convert to viewport pixels
  const x = Math.round((clampedX / (GRID_SIZE - 1)) * (viewportWidth - 1));
  const y = Math.round((clampedY / (GRID_SIZE - 1)) * (viewportHeight - 1));

  return { x, y };
};

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
        const viewportHeight = screenshot.page_context?.viewport_height;
        const viewportWidth = screenshot.page_context?.viewport_width;

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
              text:
                "Screenshot URL: " +
                screenshotUrl +
                "\nViewport size: " +
                viewportWidth +
                "x" +
                viewportHeight,
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
      description:
        "Scroll the page using normalized grid coordinates (0-999) for scroll delta. " +
        "The grid system makes scroll amounts intuitive: " +
        "positive dx = scroll right, negative dx = scroll left, " +
        "positive dy = scroll down, negative dy = scroll up. " +
        "Values are scaled to viewport dimensions.",
      inputSchema: {
        dx: z
          .number()
          .min(-999)
          .max(999)
          .describe(
            "Horizontal scroll delta in grid units (-999 to 999). Positive = right, negative = left"
          ),
        dy: z
          .number()
          .min(-999)
          .max(999)
          .describe(
            "Vertical scroll delta in grid units (-999 to 999). Positive = down, negative = up"
          ),
        viewportWidth: z.number().describe("Viewport width in pixels"),
        viewportHeight: z.number().describe("Viewport height in pixels"),
      },
    },
    async ({ dx, dy, viewportWidth, viewportHeight }) => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        // Convert grid delta to viewport pixel delta
        const pixelDx = Math.round(
          (dx / (GRID_SIZE - 1)) * (viewportWidth - 1)
        );
        const pixelDy = Math.round(
          (dy / (GRID_SIZE - 1)) * (viewportHeight - 1)
        );

        await client.computers.scrollViewport(computerId, {
          dx: pixelDx,
          dy: pixelDy,
        });
        return {
          content: [
            {
              type: "text",
              text: `Scrolled by grid (${dx}, ${dy}) → viewport pixels (${pixelDx}, ${pixelDy})`,
            },
          ],
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
        "Click a specific element on the page using normalized grid coordinates (0-999). " +
        "The grid system makes coordinate estimation intuitive: " +
        "0 = left/top edge, 500 = center, 999 = right/bottom edge. " +
        "For example, to click the center of the screen use x=500, y=500. " +
        "To click something in the top-right corner, use x=900, y=100.",
      inputSchema: {
        x: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "X coordinate in normalized grid (0-999). 0=left edge, 500=center, 999=right edge"
          ),
        y: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "Y coordinate in normalized grid (0-999). 0=top edge, 500=center, 999=bottom edge"
          ),
        viewportWidth: z.number().describe("Viewport width in pixels"),
        viewportHeight: z.number().describe("Viewport height in pixels"),
      },
    },
    async ({
      x,
      y,
      viewportWidth,
      viewportHeight,
    }): Promise<CallToolResult> => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        // Convert grid coordinates to viewport pixels
        const viewport = gridToViewport(x, y, viewportWidth, viewportHeight);

        await client.computers.click(computerId, {
          x: viewport.x,
          y: viewport.y,
        });
        return {
          content: [
            {
              type: "text",
              text: `Clicked at grid (${x}, ${y}) → viewport pixel (${viewport.x}, ${viewport.y})`,
            },
          ],
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
      description:
        "Right click on a specific element using normalized grid coordinates (0-999). " +
        "The grid system makes coordinate estimation intuitive: " +
        "0 = left/top edge, 500 = center, 999 = right/bottom edge.",
      inputSchema: {
        x: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "X coordinate in normalized grid (0-999). 0=left edge, 500=center, 999=right edge"
          ),
        y: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "Y coordinate in normalized grid (0-999). 0=top edge, 500=center, 999=bottom edge"
          ),
        viewportWidth: z.number().describe("Viewport width in pixels"),
        viewportHeight: z.number().describe("Viewport height in pixels"),
      },
    },
    async ({
      x,
      y,
      viewportWidth,
      viewportHeight,
    }): Promise<CallToolResult> => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        // Convert grid coordinates to viewport pixels
        const viewport = gridToViewport(x, y, viewportWidth, viewportHeight);

        await client.computers.rightClick(computerId, {
          x: viewport.x,
          y: viewport.y,
        });
        return {
          content: [
            {
              type: "text",
              text: `Right clicked at grid (${x}, ${y}) → viewport pixel (${viewport.x}, ${viewport.y})`,
            },
          ],
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
      description:
        "Double click on a specific element using normalized grid coordinates (0-999). " +
        "The grid system makes coordinate estimation intuitive: " +
        "0 = left/top edge, 500 = center, 999 = right/bottom edge.",
      inputSchema: {
        x: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "X coordinate in normalized grid (0-999). 0=left edge, 500=center, 999=right edge"
          ),
        y: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "Y coordinate in normalized grid (0-999). 0=top edge, 500=center, 999=bottom edge"
          ),
        viewportWidth: z.number().describe("Viewport width in pixels"),
        viewportHeight: z.number().describe("Viewport height in pixels"),
      },
    },
    async ({
      x,
      y,
      viewportWidth,
      viewportHeight,
    }): Promise<CallToolResult> => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        // Convert grid coordinates to viewport pixels
        const viewport = gridToViewport(x, y, viewportWidth, viewportHeight);

        await client.computers.doubleClick(computerId, {
          x: viewport.x,
          y: viewport.y,
        });
        return {
          content: [
            {
              type: "text",
              text: `Double clicked at grid (${x}, ${y}) → viewport pixel (${viewport.x}, ${viewport.y})`,
            },
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
      description:
        "Drag an element on the page using normalized grid coordinates (0-999). " +
        "The grid system makes coordinate estimation intuitive: " +
        "0 = left/top edge, 500 = center, 999 = right/bottom edge. " +
        "Specify start (x1, y1) and end (x2, y2) positions.",
      inputSchema: {
        x1: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "X1 coordinate in grid (0-999) to drag from. 0=left, 500=center, 999=right"
          ),
        y1: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "Y1 coordinate in grid (0-999) to drag from. 0=top, 500=center, 999=bottom"
          ),
        x2: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "X2 coordinate in grid (0-999) to drag to. 0=left, 500=center, 999=right"
          ),
        y2: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "Y2 coordinate in grid (0-999) to drag to. 0=top, 500=center, 999=bottom"
          ),
        viewportWidth: z.number().describe("Viewport width in pixels"),
        viewportHeight: z.number().describe("Viewport height in pixels"),
      },
    },
    async ({
      x1,
      y1,
      x2,
      y2,
      viewportWidth,
      viewportHeight,
    }): Promise<CallToolResult> => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        // Convert grid coordinates to viewport pixels
        const startViewport = gridToViewport(
          x1,
          y1,
          viewportWidth,
          viewportHeight
        );
        const endViewport = gridToViewport(
          x2,
          y2,
          viewportWidth,
          viewportHeight
        );

        await client.computers.drag(computerId, {
          x1: startViewport.x,
          y1: startViewport.y,
          x2: endViewport.x,
          y2: endViewport.y,
        });
        return {
          content: [
            {
              type: "text",
              text: `Dragged from grid (${x1}, ${y1}) → pixel (${startViewport.x}, ${startViewport.y}) to grid (${x2}, ${y2}) → pixel (${endViewport.x}, ${endViewport.y})`,
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

  server.registerTool(
    "mouse_down",
    {
      title: "Mouse Down",
      description:
        "Press and hold the mouse button at a specific position using normalized grid coordinates (0-999). " +
        "Use with mouse_up for fine-grained drag control, custom drag interactions, or drawing applications. " +
        "The grid system makes coordinate estimation intuitive: " +
        "0 = left/top edge, 500 = center, 999 = right/bottom edge.",
      inputSchema: {
        x: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "X coordinate in normalized grid (0-999). 0=left edge, 500=center, 999=right edge"
          ),
        y: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "Y coordinate in normalized grid (0-999). 0=top edge, 500=center, 999=bottom edge"
          ),
        viewportWidth: z.number().describe("Viewport width in pixels"),
        viewportHeight: z.number().describe("Viewport height in pixels"),
      },
    },
    async ({
      x,
      y,
      viewportWidth,
      viewportHeight,
    }): Promise<CallToolResult> => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        // Convert grid coordinates to viewport pixels
        const viewport = gridToViewport(x, y, viewportWidth, viewportHeight);

        await client.computers.executeAction(computerId, {
          action: { type: "mouse_down", x: viewport.x, y: viewport.y },
        });
        return {
          content: [
            {
              type: "text",
              text: `Mouse down at grid (${x}, ${y}) → viewport pixel (${viewport.x}, ${viewport.y})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Mouse down failed" }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "mouse_up",
    {
      title: "Mouse Up",
      description:
        "Release the mouse button at a specific position using normalized grid coordinates (0-999). " +
        "Use after mouse_down to complete fine-grained drag operations. " +
        "The grid system makes coordinate estimation intuitive: " +
        "0 = left/top edge, 500 = center, 999 = right/bottom edge.",
      inputSchema: {
        x: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "X coordinate in normalized grid (0-999). 0=left edge, 500=center, 999=right edge"
          ),
        y: z
          .number()
          .min(0)
          .max(999)
          .describe(
            "Y coordinate in normalized grid (0-999). 0=top edge, 500=center, 999=bottom edge"
          ),
        viewportWidth: z.number().describe("Viewport width in pixels"),
        viewportHeight: z.number().describe("Viewport height in pixels"),
      },
    },
    async ({
      x,
      y,
      viewportWidth,
      viewportHeight,
    }): Promise<CallToolResult> => {
      await recordActivity();
      const computerId = await getActiveComputerId();
      try {
        // Convert grid coordinates to viewport pixels
        const viewport = gridToViewport(x, y, viewportWidth, viewportHeight);

        await client.computers.executeAction(computerId, {
          action: { type: "mouse_up", x: viewport.x, y: viewport.y },
        });
        return {
          content: [
            {
              type: "text",
              text: `Mouse up at grid (${x}, ${y}) → viewport pixel (${viewport.x}, ${viewport.y})`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: "Mouse up failed" }],
          isError: true,
        };
      }
    }
  );

  return server;
};

export default getServer;
