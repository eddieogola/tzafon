import type Lightcone from "@tzafon/lightcone/index.js";
import { example } from "@/utils/example";
import { Colors } from "@/utils/term";

const PAGE = "guides/shell-commands";

const synchronousExecution = example(
  {
    page: PAGE,
    anchor: "synchronous-execution",
    title: "Synchronous Execution",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      const result = await client.computers.exec.sync(id, {
        command: "echo 'Hello from Lightcone OS!'",
      });

      console.log(`stdout: ${Colors.BLUE}${result.stdout}${Colors.RESET}`);
      console.log(`stderr: ${Colors.YELLOW}${result.stderr}${Colors.RESET}`);
      console.log(
        `exit code: ${Colors.GREEN}${result.exit_code}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const streamingExecution = example(
  { page: PAGE, anchor: "streaming-execution", title: "Streaming Execution" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      const stream = await client.computers.exec.create(id, {
        command: "printf 'line 1\\nline 2\\n'",
      });

      for await (const line of stream) {
        if (line.type === "stdout") {
          process.stdout.write(line.data ?? "");
        } else if (line.type === "stderr") {
          process.stderr.write(line.data ?? "");
        } else if (line.type === "exit") {
          console.log(`\nExit code: ${Colors.GREEN}${line.code}${Colors.RESET}`);
        } else if (line.type === "error") {
          console.log(
            `\n${Colors.RED}Stream error: ${line.message}${Colors.RESET}`,
          );
        }
      }
    } finally {
      await client.computers.delete(id);
    }
  },
);

const workingDirectoryAndEnvironment = example(
  {
    page: PAGE,
    anchor: "working-directory-and-environment",
    title: "Working Directory and Environment",
  },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      await client.computers.exec.sync(id, {
        command: "mkdir -p /tmp/lightcone-shell-demo",
      });

      const result = await client.computers.exec.sync(id, {
        command: "pwd && echo $APP_MODE",
        cwd: "/tmp/lightcone-shell-demo",
        env: {
          APP_MODE: "production",
        },
      });

      console.log(`stdout: ${Colors.BLUE}${result.stdout}${Colors.RESET}`);
      console.log(
        `exit code: ${Colors.GREEN}${result.exit_code}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const timeouts = example(
  { page: PAGE, anchor: "timeouts", title: "Timeouts" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      const result = await client.computers.exec.sync(id, {
        command: "sleep 10",
        timeout_seconds: 2,
      });

      console.log(`stdout: ${Colors.BLUE}${result.stdout}${Colors.RESET}`);
      console.log(`stderr: ${Colors.YELLOW}${result.stderr}${Colors.RESET}`);
      console.log(
        `exit code: ${Colors.GREEN}${result.exit_code}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

const commonUseCases = example(
  { page: PAGE, anchor: "common-use-cases", title: "Common Use Cases" },
  async (client: Lightcone): Promise<void> => {
    const computer = await client.computers.create({ kind: "desktop" });
    const id = computer.id!;

    try {
      const pythonResult = await client.computers.exec.sync(id, {
        command: `python3 -c "import json; print(json.dumps({'status': 'ok'}))"`,
      });
      console.log(
        `python output: ${Colors.BLUE}${(pythonResult.stdout ?? "").trim()}${Colors.RESET}`,
      );

      const processResult = await client.computers.exec.sync(id, {
        command: "ps aux | grep -m 1 python",
      });
      console.log(
        `process sample: ${Colors.YELLOW}${(processResult.stdout ?? "").trim()}${Colors.RESET}`,
      );
    } finally {
      await client.computers.delete(id);
    }
  },
);

export default async function executeShell(client: Lightcone): Promise<void> {
  console.log(
    `${Colors.YELLOW}*** Environments: Execute Shell Commands ***${Colors.RESET}\n`,
  );
  await synchronousExecution(client);
  await streamingExecution(client);
  await workingDirectoryAndEnvironment(client);
  await timeouts(client);
  await commonUseCases(client);
}
