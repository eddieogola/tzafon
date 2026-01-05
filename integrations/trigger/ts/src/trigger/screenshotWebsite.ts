import { logger, task } from "@trigger.dev/sdk";
import { config } from "dotenv";
import puppeteer from "puppeteer";
import Computer from "tzafon";

config();

const TZAFON_API_KEY = process.env.TZAFON_API_KEY;

const client = new Computer({
  apiKey: TZAFON_API_KEY,
});

export const screenshotWebsite = task({
  id: "screenshot-website",
  maxDuration: 60,
  run: async () => {
    logger.info("Starting screenshot task");
    try {
      const session = await client.create({
        kind: "browser",
      });
      logger.info(`Session created: ${session.id}`);
      const wssUrl = `ws://api.tzafon.ai/computers/${session.id}/ws?token=${TZAFON_API_KEY}`;
      logger.info(`WSS URL created: ${wssUrl}`);

      const browser = await puppeteer.connect({
        browserWSEndpoint: wssUrl,
      });

      logger.info(`Browser connected: ${browser}`);

      const page = await browser.newPage();
      await page.goto("https://tzafon.ai");

      logger.info("Page loaded");

      await page.screenshot({
        path: "tzafon.png",
      });

      logger.info("Screenshot taken");

      await browser.close();
    } catch (e) {
      logger.error(`Error: ${e.message}`);
    }
  },
});
