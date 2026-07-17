from utils.example import example
from utils.term import Colors

PAGE = "guides/shell-commands"


@example(PAGE, "synchronous-execution", title="Synchronous Execution")
def synchronous_execution(client):
	with client.computer.create(kind="desktop") as computer:
		result = client.computers.exec.sync(
			computer.id,
			command="echo 'Hello from Lightcone OS!'",
		)
		print(f"stdout: {Colors.BLUE}{result.stdout}{Colors.RESET}")
		print(f"stderr: {Colors.YELLOW}{result.stderr}{Colors.RESET}")
		print(f"exit code: {Colors.GREEN}{result.exit_code}{Colors.RESET}")


@example(PAGE, "streaming-execution", title="Streaming Execution")
def streaming_execution(client):
	with client.computer.create(kind="desktop") as computer:
		stream = client.computers.exec.create(
			computer.id,
			command="printf 'line 1\\nline 2\\n'",
		)

		for line in stream:
			line_type = getattr(line, "type", None)
			if line_type == "stdout":
				print(getattr(line, "data", ""), end="")
			elif line_type == "stderr":
				print(f"ERR: {getattr(line, 'data', '')}", end="")
			elif line_type == "exit":
				print(
					f"\nExit code: {Colors.GREEN}{getattr(line, 'code', 'unknown')}{Colors.RESET}"
				)
			elif line_type == "error":
				print(
					f"\n{Colors.RED}Stream error: {getattr(line, 'message', 'unknown error')}{Colors.RESET}"
				)


@example(
	PAGE,
	"working-directory-and-environment",
	title="Working Directory and Environment",
)
def working_directory_and_environment(client):
	with client.computer.create(kind="desktop") as computer:
		client.computers.exec.sync(
			computer.id,
			command="mkdir -p /tmp/lightcone-shell-demo",
		)
		result = client.computers.exec.sync(
			computer.id,
			command="pwd && echo $APP_MODE",
			cwd="/tmp/lightcone-shell-demo",
			env={"APP_MODE": "production"},
		)
		print(f"stdout: {Colors.BLUE}{result.stdout}{Colors.RESET}")
		print(f"exit code: {Colors.GREEN}{result.exit_code}{Colors.RESET}")


@example(PAGE, "timeouts", title="Timeouts")
def timeouts(client):
	with client.computer.create(kind="desktop") as computer:
		result = client.computers.exec.sync(
			computer.id,
			command="sleep 10",
			timeout_seconds=2,
		)
		print(f"stdout: {Colors.BLUE}{result.stdout}{Colors.RESET}")
		print(f"stderr: {Colors.YELLOW}{result.stderr}{Colors.RESET}")
		print(f"exit code: {Colors.GREEN}{result.exit_code}{Colors.RESET}")


@example(PAGE, "common-use-cases", title="Common Use Cases")
def common_use_cases(client):
	with client.computer.create(kind="desktop") as computer:
		python_result = client.computers.exec.sync(
			computer.id,
			command='''python3 -c "import json; print(json.dumps({'status': 'ok'}))"''',
		)
		print(f"python output: {Colors.BLUE}{python_result.stdout.strip()}{Colors.RESET}")

		process_result = client.computers.exec.sync(
			computer.id,
			command="ps aux | grep -m 1 python",
		)
		print(
			f"process sample: {Colors.YELLOW}{process_result.stdout.strip()}{Colors.RESET}"
		)


def execute_shell(client):
	print(f"{Colors.YELLOW}*** Environments: Execute Shell Commands ***{Colors.RESET}\n")
	synchronous_execution(client)
	streaming_execution(client)
	working_directory_and_environment(client)
	timeouts(client)
	common_use_cases(client)
