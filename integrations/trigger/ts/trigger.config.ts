import { aptGet } from "@trigger.dev/build/extensions/core";
import { puppeteer } from "@trigger.dev/build/extensions/puppeteer";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "your_project_id", // grab from the Trigger dashboard https://cloud.trigger.dev/
  logLevel: "log",
  build: {
    extensions: [aptGet({ packages: ["mupdf-tools", "curl"] }), puppeteer()],
  },
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
});
