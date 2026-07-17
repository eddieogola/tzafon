import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "use-cases/cross-app-workflows";

const moveDataBetweenWebAppAndSpreadsheet = example(
  {
    page: PAGE,
    anchor: "move-data-between-a-web-app-and-a-spreadsheet",
    title: "Move Data Between a Web App and a Spreadsheet",
  },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open Firefox and go to https://crm.example.com. Log in with 'ops@example.com' / 'ops123'. " +
        "Navigate to the Contacts page. Find the contact 'Acme Corp'. " +
        "Note their email address, phone number, and account status. " +
        "Then open LibreOffice Calc. " +
        "Enter the headers 'Company', 'Email', 'Phone', 'Status' in row 1. " +
        "Enter the Acme Corp data in row 2. " +
        "Save the file as /tmp/acme-export.csv.",
      kind: "desktop",
      max_steps: 40,
    });

    for await (const event of stream) {
      console.log(event);
    }
  },
);

const processBatchAcrossSystems = example(
  {
    page: PAGE,
    anchor: "process-a-batch-across-systems",
    title: "Process a Batch Across Systems",
  },
  async (client: Lightcone): Promise<void> => {
    const records = [
      { name: "Acme Corp", action: "renew" },
      { name: "Globex Inc", action: "upgrade" },
      { name: "Initech LLC", action: "cancel" },
    ];

    for (const record of records) {
      console.log(`Processing ${record.name}...`);

      const stream = await client.agent.tasks.startStream({
        instruction:
          `Open Firefox and go to https://portal.example.com. ` +
          `Search for '${record.name}'. ` +
          `Click on their account. ` +
          `Click the '${record.action}' button. ` +
          `Confirm the action. ` +
          `Report whether it succeeded.`,
        kind: "desktop",
        max_steps: 20,
      });

      for await (const event of stream) {
        console.log(`  ${JSON.stringify(event)}`);
      }
    }
  },
);

const usePersistentStateForMultiSessionWorkflows = example(
  {
    page: PAGE,
    anchor: "use-persistent-state-for-multi-session-workflows",
    title: "Use Persistent State for Multi-session Workflows",
  },
  async (client: Lightcone): Promise<void> => {
    // First run: set up the environment
    const computer = await client.computers.create({
      kind: "desktop",
      persistent: true,
    });
    const savedId = computer.id!;

    // Install tools Northstar will need
    await client.computers.exec.sync(savedId, {
      command: "apt-get install -y libreoffice",
    });
    console.log(`Environment ready: ${Colors.YELLOW}${savedId}${Colors.RESET}`);

    // Release the environment — it persists, so a later run can resume it by id.
    await client.computers.delete(savedId);

    // Subsequent runs: reuse the environment
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open LibreOffice Calc, load /tmp/data.csv, and add a 'Total' column that sums columns B through D",
      kind: "desktop",
      environment_id: savedId,
    });

    for await (const event of stream) {
      console.log(event);
    }
  },
);

export default async function crossAppWorkflows(
  client: Lightcone,
): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Cross-Application Workflows Use Cases ***${Colors.RESET}\n`,
  );
  await moveDataBetweenWebAppAndSpreadsheet(client);
  await processBatchAcrossSystems(client);
  await usePersistentStateForMultiSessionWorkflows(client);
}
