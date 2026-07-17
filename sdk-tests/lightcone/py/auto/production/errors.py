from tzafon import APIStatusError, AuthenticationError, Lightcone, NotFoundError
from utils.example import example
from utils.term import Colors

PAGE = "guides/errors"


@example(PAGE, "error-body-shape", title="Error Body Shape")
def error_body_shape(client):
    # The docs show the problem+json body but no code. Provoke a real 404 and
    # check the response carries the documented RFC 7807 fields.
    try:
        client.computers.retrieve("does-not-exist")
    except APIStatusError as e:
        print(f"Content-Type: {Colors.YELLOW}{e.response.headers.get('content-type')}{Colors.RESET}")

        body = e.body  # decoded problem+json document
        print(f"{Colors.YELLOW}{body}{Colors.RESET}\n")

        for field in ("type", "title", "status", "detail", "instance"):
            present = isinstance(body, dict) and field in body
            color = Colors.GREEN if present else Colors.RED
            print(f"  {field:9} {color}{'present' if present else 'MISSING'}{Colors.RESET}")


@example(PAGE, "status-codes", title="Status Codes")
def status_codes(client):
    # 401 — missing or invalid API key
    try:
        Lightcone(api_key="not-a-real-key").computers.list()
    except AuthenticationError as e:
        print(f"401 -> {Colors.GREEN}{type(e).__name__}{Colors.RESET}: {e.status_code}")

    # 404 — resource does not exist, or belongs to another organization
    try:
        client.computers.retrieve("does-not-exist")
    except NotFoundError as e:
        print(f"404 -> {Colors.GREEN}{type(e).__name__}{Colors.RESET}: {e.status_code}")


@example(PAGE, "task-level-errors-sse-events", title="Task-Level Errors (SSE Events)")
def task_level_errors_sse_events(client):
    # Docs write `event.type` / `event.retryable`; the Python stream yields
    # dicts, so attribute access raises AttributeError. Use dict access.
    stream = client.agent.tasks.start_stream(instruction="...", kind="browser")
    for event in stream:
        print(event)
        if event.get("type") == "failed":
            if event.get("retryable"):
                pass  # resubmit the task
            else:
                raise RuntimeError(f"Task failed: {event.get('error_code')}")
        if event.get("type") in ("completed", "failed", "config_error"):
            break

    stream.close()


@example(PAGE, "action-level-failures", title="Action-Level Failures")
def action_level_failures(client):
    with client.computer.create(kind="browser") as computer:
        # A host that cannot resolve: the API returns HTTP 200, the
        # ActionResult carries the failure.
        result = computer.navigate("https://this-host-does-not-exist.invalid")
        if result.status != "success":
            print(f"Navigation failed: {Colors.RED}{result.error_message}{Colors.RESET}")
        else:
            print(f"{Colors.YELLOW}Unexpectedly succeeded: {result.status}{Colors.RESET}")

        # Contrast with a navigation that works
        result = computer.navigate("https://example.com")
        print(f"Status: {Colors.GREEN}{result.status}{Colors.RESET}")


def errors_guide(client):
    print(f"{Colors.YELLOW}*** Production: Errors and Status Codes ***{Colors.RESET}\n")
    error_body_shape(client)
    status_codes(client)
    # task_level_errors_sse_events(client)
    action_level_failures(client)
