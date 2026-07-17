from utils.example import example
from utils.term import Colors

PAGE = "guides/production"

# Docs use a placeholder app; the suite needs a URL that actually resolves.
PING_URL = "https://example.com"


@example(PAGE, "pin-your-model-version", title="Pin Your Model Version")
def pin_your_model_version(client):
    task = client.agent.tasks.start(
        instruction="...",
        kind="browser",
        model="tzafon.northstar-cua-fast-1.6",  # pinned
    )
    print(f"Task: {Colors.YELLOW}{task.task_id}{Colors.RESET}")
    print(f"Status: {Colors.GREEN}{task.status}{Colors.RESET}")


@example(
    PAGE,
    "make-retries-safe-with-idempotency-keys",
    title="Make Retries Safe With Idempotency Keys",
)
def make_retries_safe_with_idempotency_keys(client):
    task = client.agent.tasks.start(
        instruction="Submit the expense report for invoice INV-4821",
        kind="browser",
        idempotency_key="expense-INV-4821",
    )
    if task.reused:
        print(f"Already running as {Colors.YELLOW}{task.task_id}{Colors.RESET}")

    # Retrying with the same key must return the same task with reused: true
    retry = client.agent.tasks.start(
        instruction="Submit the expense report for invoice INV-4821",
        kind="browser",
        idempotency_key="expense-INV-4821",
    )
    print(f"First task : {Colors.YELLOW}{task.task_id}{Colors.RESET}")
    print(f"Retried    : {Colors.YELLOW}{retry.task_id}{Colors.RESET} reused={retry.reused}")


@example(PAGE, "session-hygiene", title="Session Hygiene")
def session_hygiene(client):
    with client.computer.create(kind="browser") as computer:
        computer.navigate(PING_URL)

        computer.keep_alive()  # call periodically during long gaps between actions
        print(f"{Colors.GREEN}Keep-alive sent{Colors.RESET}")

        status = client.computers.retrieve_status(computer.id)
        print(f"Status: {Colors.YELLOW}{status}{Colors.RESET}")


@example(
    PAGE,
    "warm-sessions-for-latency-sensitive-services",
    title="Warm Sessions for Latency-Sensitive Services",
)
def warm_sessions_for_latency_sensitive_services(client):
    def get_computer(client, env_id):
        # Adopt a live computer if one exists
        for c in client.computers.list():
            if c.status == "running":
                try:
                    # Verify liveness with a cheap real action
                    # a stale session can still return screenshots
                    client.computers.navigate(c.id, url=PING_URL)
                    return c
                except Exception:
                    client.computers.delete(c.id)
        # Otherwise recreate from the authenticated snapshot
        return client.computers.create(
            kind="browser", environment_id=env_id, persistent=True
        )

    # Seed a persistent snapshot to adopt or restore from
    seed = client.computers.create(kind="browser", persistent=True)
    client.computers.navigate(seed.id, url=PING_URL)
    client.computers.delete(seed.id)

    computer = get_computer(client, seed.id)
    try:
        print(f"Adopted computer: {Colors.YELLOW}{computer.id}{Colors.RESET}")
        print(f"Status: {Colors.GREEN}{computer.status}{Colors.RESET}")
    finally:
        client.computers.delete(computer.id)


@example(PAGE, "set-timeouts-at-every-layer", title="Set Timeouts at Every Layer")
def set_timeouts_at_every_layer(client):
    job_id = "job-4821"

    task = client.agent.tasks.start(
        instruction="...",
        kind="browser",
        model="tzafon.northstar-cua-fast-1.6",
        max_steps=40,
        max_duration_seconds=600,
        idempotency_key=job_id,
    )
    print(f"Task: {Colors.YELLOW}{task.task_id}{Colors.RESET}")
    print(f"Status: {Colors.GREEN}{task.status}{Colors.RESET}")


def production_guide(client):
    print(f"{Colors.YELLOW}*** Production: Running in Production ***{Colors.RESET}\n")
    # pin_your_model_version(client)
    # make_retries_safe_with_idempotency_keys(client)
    session_hygiene(client)
    warm_sessions_for_latency_sensitive_services(client)
    # set_timeouts_at_every_layer(client)
