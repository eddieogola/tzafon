import dotenv from "dotenv";
import Computer, { ComputerSession } from "tzafon";

dotenv.config();

if (!process.env.TZAFON_API_KEY) {
  throw new Error("TZAFON_API_KEY is required");
}

class TzafonBrowser {
  client: Computer;
  session?: ComputerSession;

  constructor() {
    this.client = new Computer({ apiKey: process.env.TZAFON_API_KEY });
  }

  async createSession() {
    this.session = await this.client.create({
      kind: "browser",
    });
    return this.session;
  }

  async getSession() {
    if (!this.session) {
      this.session = await this.createSession();
    }
    return this.session;
  }

  async terminateSession() {
    if (this.session) {
      await this.session.terminate();
      this.session = undefined;
    }
  }
}

export const tzafonBrowser = new TzafonBrowser();
