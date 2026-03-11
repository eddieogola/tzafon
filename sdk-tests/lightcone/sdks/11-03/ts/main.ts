import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(import.meta.dirname, "../.env") });
import Lightcone from "@tzafon/lightcone";
import { createBrowserSession } from "./auto/getting-started/browserSession";

const client = new Lightcone();

console.log(process.env.TZAFON_API_KEY ? "API key loaded successfully" : "API key not found. Please set the TZAFON_API_KEY environment variable.");

/*
 * Getting Started
 */

createBrowserSession(client);
