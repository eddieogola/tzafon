import Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/authentication";

/** Set the environment variable — SDK reads TZAFON_API_KEY automatically. */
const fromEnvironment = example(
  {
    page: PAGE,
    anchor: "set-the-environment-variable",
    title: "Authentication: From Environment Variable",
  },
  async (): Promise<void> => {
    const client = new Lightcone(); // reads TZAFON_API_KEY from environment
    console.log(
      `Client base URL : ${Colors.GREEN}${client.baseURL}${Colors.RESET}`,
    );
  },
);

/** Pass the key explicitly instead of relying on the environment variable. */
const passKeyExplicitly = example(
  {
    page: PAGE,
    anchor: "pass-the-key-explicitly",
    title: "Authentication: Pass Key Explicitly",
  },
  async (): Promise<void> => {
    const client = new Lightcone({ apiKey: process.env.TZAFON_API_KEY! });
    console.log(
      `Client base URL : ${Colors.GREEN}${client.baseURL}${Colors.RESET}`,
    );
  },
);

/** Base URL — override for custom deployments or self-hosted instances. */
const customBaseUrl = example(
  { page: PAGE, anchor: "base-url", title: "Authentication: Custom Base URL" },
  async (): Promise<void> => {
    const client = new Lightcone({
      baseURL: "https://your-deployment.example.com",
    });
    console.log(
      `Client base URL : ${Colors.GREEN}${client.baseURL}${Colors.RESET}`,
    );
  },
);

/** Configure timeouts and retries — both SDKs retry on connection errors and 5xx responses. */
const timeoutsAndRetries = example(
  {
    page: PAGE,
    anchor: "configure-timeouts-and-retries",
    title: "Authentication: Timeouts and Retries",
  },
  async (): Promise<void> => {
    const client = new Lightcone({
      timeout: 30000, // milliseconds
      maxRetries: 3,
    });
    console.log(
      `Client base URL : ${Colors.GREEN}${client.baseURL}${Colors.RESET}`,
    );
  },
);

export default async function authenticationGuide(): Promise<void> {
  await fromEnvironment();
  await passKeyExplicitly();
  await customBaseUrl();
  await timeoutsAndRetries();
}
