import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "use-cases/legacy-software";

const operateLegacyWebApplication = example(
  {
    page: PAGE,
    anchor: "operate-a-legacy-web-application",
    title: "Operate a Legacy Web Application",
  },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open Firefox and go to https://crm.example.com. " +
        "Log in with 'ops@example.com' / 'ops123'. " +
        "Navigate to Contacts > New Contact. " +
        "Fill in: First Name 'Jane', Last Name 'Smith', " +
        "Email 'jane.smith@acme.com', Company 'Acme Corp'. " +
        "Click Save. " +
        "Verify the contact was created successfully.",
      kind: "desktop",
      max_steps: 30,
    });

    for await (const event of stream) {
      console.log(event);
    }
  },
);

const operateDesktopApplication = example(
  {
    page: PAGE,
    anchor: "operate-a-desktop-application",
    title: "Operate a Desktop Application",
  },
  async (client: Lightcone): Promise<void> => {
    // Set up the environment
    const computer = await client.computers.create({
      kind: "desktop",
      persistent: true,
    });
    const savedId = computer.id!;

    await client.computers.exec.sync(savedId, {
      command: "apt-get install -y libreoffice",
    });

    // Release the environment — it persists, so the task can resume it by id.
    await client.computers.delete(savedId);

    // Run the task
    const stream = await client.agent.tasks.startStream({
      instruction:
        "Open LibreOffice Calc. " +
        "Create a new spreadsheet with columns: Date, Description, Amount, Category. " +
        "Enter 5 sample expense entries. " +
        "Add a SUM formula at the bottom of the Amount column. " +
        "Save the file as /tmp/expenses.xlsx.",
      kind: "desktop",
      environment_id: savedId, // reuse the environment with LibreOffice installed
      max_steps: 40,
    });

    for await (const event of stream) {
      console.log(event);
    }
  },
);

const processQueueOfRecords = example(
  {
    page: PAGE,
    anchor: "process-a-queue-of-records",
    title: "Process a Queue of Records",
  },
  async (client: Lightcone): Promise<void> => {
    const records = [
      { name: "Jane Smith", email: "jane@acme.com", role: "Manager" },
      { name: "Bob Chen", email: "bob@acme.com", role: "Engineer" },
      { name: "Sara Lee", email: "sara@acme.com", role: "Director" },
    ];

    for (const record of records) {
      console.log(`Creating user: ${record.name}`);

      const stream = await client.agent.tasks.startStream({
        instruction:
          `Go to https://admin.example.com/users/new. ` +
          `Fill in Name: '${record.name}', Email: '${record.email}', Role: '${record.role}'. ` +
          "Click Create User. Verify the success message appears.",
        kind: "desktop",
        max_steps: 15,
      });

      for await (const event of stream) {
        console.log(`  ${JSON.stringify(event)}`);
      }
    }
  },
);

export default async function legacySoftware(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Legacy Software Automation Use Cases ***${Colors.RESET}\n`,
  );
  await operateLegacyWebApplication(client);
  await operateDesktopApplication(client);
  await processQueueOfRecords(client);
}
