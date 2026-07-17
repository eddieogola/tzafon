/**
 * Using Northstar to validate documentation.
 *
 * https://docs.lightcone.ai/use-cases/docs-validation/
 *
 * Two deliberate deviations from the page, both about coordinates — which is
 * awkward, because coordinates are the entire subject of the page:
 *
 * 1. The page's example 1 prints `item.action.x` / `item.action.y` straight from
 *    the response. Those are 0-999 model space (see `utils/coords`), but example 2
 *    feeds pixel coordinates to `computers.click()`. Copy example 1's output into
 *    example 2 as the page tells you to and you click the wrong part of the screen.
 *    We denormalize with `toPx` before printing, so the healed numbers are in the
 *    space the next example actually consumes.
 *
 * 2. The page hardcodes example 2's coordinates. A docs-validation page that
 *    hardcodes coordinates has the same rot it exists to cure, so example 1's
 *    discovered coordinates are threaded into example 2 via module state — the
 *    `SESSION_ID` pattern from `auto/tutorials/loginScrape.ts`. The page's
 *    literals stay as `DOCS_COORDS`, used only when example 2 runs standalone.
 *    Then the check in example 2 is a real test of the healing loop rather than a
 *    test of three numbers someone typed in 2026.
 */

import type Lightcone from "@tzafon/lightcone/index.js";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH, toPx } from "@/utils/coords";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "use-cases/docs-validation";

const tool = {
  type: "computer_use" as const,
  display_width: DISPLAY_WIDTH,
  display_height: DISPLAY_HEIGHT,
  environment: "browser",
};

// The page's example 1 iterates a plain list and prints the element name. We key
// the same descriptions so the discovered pixels can be threaded into example 2.
const ELEMENTS = {
  username: "username input field",
  password: "password input field",
  login: "Login button",
} as const;

type ElementKey = keyof typeof ELEMENTS;

// The page's example 2 literals. Fallback only — see the module docstring.
const DOCS_COORDS: Record<ElementKey, [number, number]> = {
  username: [189, 163],
  password: [189, 246],
  login: [93, 302],
};

// Populated by selfHealCoordinateDependentExamples, consumed by
// verifyTheFixEndToEnd. Pixels, already denormalized.
const HEALED_COORDS: Partial<Record<ElementKey, [number, number]>> = {};

const selfHealCoordinateDependentExamples = example(
  {
    page: PAGE,
    anchor: "self-heal-coordinate-dependent-examples",
    title: "Self-heal Coordinate-dependent Examples",
  },
  async (client: Lightcone): Promise<void> => {
    for (const key of Object.keys(HEALED_COORDS) as ElementKey[]) {
      delete HEALED_COORDS[key];
    }

    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, {
        url: "https://quotes.toscrape.com/login",
      });
      await new Promise((r) => setTimeout(r, 2000));
      const ss = await client.computers.screenshot(id);
      const screenshotUrl = ss.result?.screenshot_url as string;

      for (const [key, element] of Object.entries(ELEMENTS) as [
        ElementKey,
        string,
      ][]) {
        const response: any = await client.responses.create({
          model: "tzafon.northstar-cua-fast-1.6",
          tools: [tool as any],
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: `Click the ${element}` },
                {
                  type: "input_image",
                  image_url: screenshotUrl,
                  detail: "auto",
                } as any,
              ],
            },
          ],
        });

        for (const item of response.output ?? []) {
          if (item.type !== "computer_call") continue;
          // The page prints action.x/action.y raw. They are 0-999 model space;
          // example 2 clicks pixels. Denormalize or the healed numbers are wrong
          // in exactly the way this page warns about.
          const x = toPx(item.action?.x, DISPLAY_WIDTH);
          const y = toPx(item.action?.y, DISPLAY_HEIGHT);
          HEALED_COORDS[key] = [x, y];
          console.log(
            `${element}: model (${item.action?.x}, ${item.action?.y}) -> pixel (${x}, ${y})`,
          );
          break;
        }
      }
    } finally {
      await client.computers.delete(id);
    }

    const missing = (Object.keys(ELEMENTS) as ElementKey[]).filter(
      (key) => !HEALED_COORDS[key],
    );
    if (missing.length) {
      throw new Error(
        `No coordinates returned for: ${missing.map((k) => ELEMENTS[k]).join(", ")}`,
      );
    }

    for (const key of Object.keys(ELEMENTS) as ElementKey[]) {
      const [x, y] = HEALED_COORDS[key]!;
      const driftX = x - DOCS_COORDS[key][0];
      const driftY = y - DOCS_COORDS[key][1];
      console.log(`${key}: drift vs docs literal (${driftX}, ${driftY})`);
    }
  },
);

const verifyTheFixEndToEnd = example(
  {
    page: PAGE,
    anchor: "verify-the-fix-end-to-end",
    title: "Verify the Fix End-to-end",
  },
  async (client: Lightcone): Promise<void> => {
    const healed = (Object.keys(ELEMENTS) as ElementKey[]).every(
      (key) => HEALED_COORDS[key],
    );
    // Standalone run — no healing pass to draw on, so use the page's numbers.
    const coords: Record<ElementKey, [number, number]> = healed
      ? (HEALED_COORDS as Record<ElementKey, [number, number]>)
      : DOCS_COORDS;
    console.log(
      healed
        ? `${Colors.YELLOW}Using healed coordinates${Colors.RESET}`
        : `${Colors.YELLOW}Using the docs' hardcoded coordinates${Colors.RESET}`,
    );

    const computer = await client.computers.create({ kind: "browser" });
    const id = computer.id!;

    try {
      await client.computers.navigate(id, {
        url: "https://quotes.toscrape.com/login",
      });
      await new Promise((r) => setTimeout(r, 2000));

      await client.computers.click(id, {
        x: coords.username[0],
        y: coords.username[1],
      });
      await client.computers.type(id, { text: "scraper" });
      await client.computers.click(id, {
        x: coords.password[0],
        y: coords.password[1],
      });
      await client.computers.type(id, { text: "password" });
      await client.computers.click(id, { x: coords.login[0], y: coords.login[1] });
      await new Promise((r) => setTimeout(r, 2000));

      const html = await client.computers.html(id);
      const content = html.result?.html_content as string;
      if (!content?.includes("Logout")) {
        throw new Error("Login failed; coordinates may still be wrong");
      }
      console.log(
        `${Colors.GREEN}Verified: tutorial works with healed coordinates${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const letNorthstarRunTheTutorialItself = example(
  {
    page: PAGE,
    anchor: "let-northstar-run-the-tutorial-itself",
    title: "Let Northstar Run the Tutorial Itself",
  },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Go to https://quotes.toscrape.com/login. " +
        "Log in with username 'scraper' and password 'password'. " +
        "After logging in, verify you can see quotes on the page. " +
        "Report whether the login succeeded and what quotes you see.",
      kind: "browser",
      max_steps: 15,
    });

    for await (const event of stream) {
      console.log(event);
    }
  },
);

export default async function docsValidation(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Documentation Validation Use Cases ***${Colors.RESET}\n`,
  );
  await selfHealCoordinateDependentExamples(client);
  await verifyTheFixEndToEnd(client);
  await letNorthstarRunTheTutorialItself(client);
}
