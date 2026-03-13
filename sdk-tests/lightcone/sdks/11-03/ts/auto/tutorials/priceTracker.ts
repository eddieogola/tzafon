import type Lightcone from "@tzafon/lightcone";
import { Colors } from "@/utils/term";
import { readFileSync, writeFileSync, existsSync } from "fs";

const PRICE_FILE = "prices.json";
const URL =
  "https://books.toscrape.com/catalogue/sapiens-a-brief-history-of-humankind_996/index.html";

interface PriceEntry {
  price: number;
  screenshot: string;
  timestamp: string;
}

function loadPrices(): PriceEntry[] {
  if (existsSync(PRICE_FILE)) {
    return JSON.parse(readFileSync(PRICE_FILE, "utf-8"));
  }
  return [];
}

function savePrice(price: number, screenshotUrl: string): PriceEntry[] {
  const prices = loadPrices();
  prices.push({
    price,
    screenshot: screenshotUrl,
    timestamp: new Date().toISOString(),
  });
  writeFileSync(PRICE_FILE, JSON.stringify(prices, null, 2));
  return prices;
}

async function createBrowserAndVisitPage(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Creating Browser and Visiting Page ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/build-a-price-tracker/#step-1-create-a-browser-and-visit-a-page${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, { url: URL });
    await new Promise((r) => setTimeout(r, 2000));

    const result = await client.computers.screenshot(id);
    console.log(
      `Screenshot URL: ${Colors.BLUE}${result.result?.screenshot_url}${Colors.RESET}\n`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error building price tracker: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function extractPriceFromPage(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Extracting Price from Page ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/build-a-price-tracker/#step-2-extract-the-price-from-the-page${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, { url: URL });
    await new Promise((r) => setTimeout(r, 2000));

    const htmlResult = await client.computers.html(id);
    const html = htmlResult.result?.html_content as string;

    const match = html.match(/price_color">\u00a3([\d.]+)</);
    const price = match ? parseFloat(match[1]) : null;
    console.log(
      `Current price: ${Colors.YELLOW}\u00a3${price}${Colors.RESET}\n`,
    );
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error building price tracker: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function savePricesAndDetectChanges(client: Lightcone): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Saving Prices and Detecting Changes ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/build-a-price-tracker/#step-3-save-prices-and-detect-changes${Colors.RESET}\n`,
  );

  const computer = await client.computers.create({ kind: "browser" });
  const id = computer.id!;

  try {
    await client.computers.navigate(id, { url: URL });
    await new Promise((r) => setTimeout(r, 2000));

    // Extract price
    const htmlResult = await client.computers.html(id);
    const html = htmlResult.result?.html_content as string;
    const match = html.match(/price_color">\u00a3([\d.]+)</);
    const price = match ? parseFloat(match[1]) : 0;

    // Take a screenshot as proof
    const result = await client.computers.screenshot(id);
    const screenshot = result.result?.screenshot_url as string;

    const prices = savePrice(price, screenshot);

    console.log(
      `Current price: ${Colors.YELLOW}\u00a3${price}${Colors.RESET}\n`,
    );
    console.log(`Screenshot URL: ${Colors.BLUE}${screenshot}${Colors.RESET}\n`);

    // Compare with previous price
    if (prices.length > 1) {
      const previous = prices[prices.length - 2].price;
      if (price < previous) {
        console.log(
          `PRICE DROP! ${Colors.GREEN}\u00a3${previous} \u2192 \u00a3${price}${Colors.RESET} (save \u00a3${(previous - price).toFixed(2)})`,
        );
      } else if (price > previous) {
        console.log(
          `Price increased: ${Colors.RED}\u00a3${previous} \u2192 \u00a3${price}${Colors.RESET}`,
        );
      } else {
        console.log(
          `Price unchanged: ${Colors.YELLOW}\u00a3${price}${Colors.RESET}`,
        );
      }
    } else {
      console.log("First check \u2014 will compare on next run");
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error building price tracker: ${e}${Colors.RESET}\n`,
    );
  } finally {
    await client.computers.delete(id);
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

async function usePersistentSessionForFasterChecks(
  client: Lightcone,
): Promise<void> {
  const startTime = Date.now();
  console.log(
    `${Colors.YELLOW}*** Using Persistent Session ***${Colors.RESET}\n`,
  );
  console.log(
    `Reference: ${Colors.BLUE}https://docs.lightcone.ai/tutorials/build-a-price-tracker/#step-4-use-a-persistent-session-for-faster-checks${Colors.RESET}\n`,
  );

  try {
    // First run: create and save the session
    const session = await client.computers.create({
      kind: "browser",
      persistent: true,
    });
    await client.computers.navigate(session.id!, { url: URL });
    await client.computers.delete(session.id!);
    console.log(
      `Session saved: ${Colors.YELLOW}${session.id}${Colors.RESET}\n`,
    );

    // Subsequent runs: reuse the session
    const restored = await client.computers.create({
      kind: "browser",
      environment_id: session.id!,
    });
    try {
      await client.computers.navigate(restored.id!, { url: URL });

      const htmlResult = await client.computers.html(restored.id!);
      const html = htmlResult.result?.html_content as string;

      const match = html.match(/price_color">\u00a3([\d.]+)</);
      const price = match ? parseFloat(match[1]) : null;
      console.log(
        `Current price: ${Colors.YELLOW}\u00a3${price}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(restored.id!);
    }
  } catch (e) {
    console.log(
      `\n${Colors.RED}Error building price tracker: ${e}${Colors.RESET}\n`,
    );
  } finally {
    const endTime = Date.now();
    console.log(
      `\n${Colors.GREEN}Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds${Colors.RESET}\n`,
    );
  }
}

export default async function buildPriceTracker(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Building Price Tracker ***${Colors.RESET}\n`,
  );
  await createBrowserAndVisitPage(client);
  await extractPriceFromPage(client);
  await savePricesAndDetectChanges(client);
  await usePersistentSessionForFasterChecks(client);
}
