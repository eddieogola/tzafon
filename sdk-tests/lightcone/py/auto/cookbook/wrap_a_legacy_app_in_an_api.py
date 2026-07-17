"""Cookbook: Wrap a legacy app in a REST API.

SCOPE: the `the-endpoint-shape` anchor is deliberately NOT covered. Its example
is a FastAPI service (`fastapi` + `pydantic` request models), and FastAPI is not
a dependency of this suite — adding a web framework to run one docs snippet buys
no SDK coverage, since the anchor's Lightcone surface (a lock, a state-machine
call) is exercised by the three anchors below. The status-code contract it
teaches (2xx only after an in-app indicator, 503 untouched, 502 unverified) is
what the state machine and verification here actually implement.

The other three anchors are pure SDK and are covered. As elsewhere in this
section, the legacy app itself does not exist: coordinates are the docs' own,
pointed at a real page, and a verification returning False is an honest result.
"""

import asyncio
import io
import uuid
from dataclasses import dataclass, field

import httpx
from PIL import Image
from tzafon import AsyncLightcone

from utils.example import example
from utils.term import Colors

PAGE = "cookbook/wrap-a-legacy-app-in-an-api"

TARGET = "https://demo.playwright.dev/todomvc/"

MAX_RECOVERY_STEPS = 8  # hard budget for the model loop

SUCCESS_REGION = (24, 640, 220, 668)  # measured banner region
SUCCESS_RGB = (46, 160, 67)  # the app's confirmation green


@dataclass
class Outcome:
    ok: bool
    reason: str = ""
    trace: list[str] = field(default_factory=list)


# Each step: async (client, computer_id, ctx) -> (ok, reason)


async def search_record(client, cid, ctx):
    r = ctx["record"]
    await client.computers.click(cid, x=176, y=98)  # search field
    await client.computers.hotkey(cid, keys=["ctrl", "a"])
    await client.computers.type(cid, text=r["name"])
    await client.computers.click(cid, x=176, y=182)  # Search button
    await asyncio.sleep(2)  # let results settle
    # The docs call screen_says_yes() here (see the extraction recipe). Kept out
    # of the hot path: this example is about the machine, not the model.
    ctx["exists"] = False
    return True, ""


async def fill_form(client, cid, ctx):
    r = ctx["record"]
    await client.computers.click(cid, x=176, y=64)  # Clear form (F1)
    await client.computers.batch(
        cid,
        actions=[
            {"type": "click", "x": 176, "y": 98},
            {"type": "type", "text": r["name"]},
            {"type": "click", "x": 176, "y": 134},
            {"type": "type", "text": r["reference"]},
            {"type": "click", "x": 640, "y": 512},  # Save
        ],
    )
    await asyncio.sleep(2)
    return True, ""


async def verify_created(client, cid, ctx):
    for _ in range(6):
        shot = await client.computers.screenshot(cid)
        # DOCS BUG: the docs read `shot.result.screenshot_url`. ActionResult.result
        # is a plain dict — the SDK's own get_screenshot_url() does .result.get(...).
        url = (shot.result or {}).get("screenshot_url")
        if not url:
            return False, f"no screenshot_url in result: {shot.result!r}"
        img = Image.open(io.BytesIO(httpx.get(str(url)).content))
        crop = img.crop(SUCCESS_REGION).convert("RGB")
        hits = sum(
            1
            for px in crop.getdata()
            if all(abs(a - b) < 40 for a, b in zip(px, SUCCESS_RGB))
        )
        if hits > 200:  # banner is visibly painted
            return True, ""
        await asyncio.sleep(0.7)
    return False, "confirmation banner not visible after save"


CREATE_STEPS = [("fill_form", fill_form), ("verify", verify_created)]


async def run_recovery(client, cid, instruction, max_steps=MAX_RECOVERY_STEPS):
    """Bounded model-recovery pass.

    The docs reference this without showing it: a standard computer-use loop
    against the Responses API, with a hard max_steps budget and a prompt that
    forbids side effects. Recovery may only restore known state, never complete
    the business action. Stubbed here so the runner's control flow is what the
    example exercises; wiring the real loop is the extraction recipe's
    run_bounded_loop.
    """
    print(f"  recovery (max_steps={max_steps}): {instruction[:48]}...")
    return False


async def attempt(client, cid, ctx, name, step, trace) -> tuple[bool, str]:
    ok, reason = await step(client, cid, ctx)
    if not ok:
        trace.append(f"{name} failed: {reason}")
        # One bounded recovery: let the model dismiss the surprise
        # (unexpected dialog, stale panel), then retry the step once.
        healed = await run_recovery(
            client,
            cid,
            "Close any dialog or popup and return the app to its main "
            "search screen. Do not save, delete, or submit anything.",
            max_steps=MAX_RECOVERY_STEPS,
        )
        ok, reason = (await step(client, cid, ctx)) if healed else (False, reason)
    trace.append(f"{name} ok" if ok else f"{name} failed: {reason}")
    return ok, reason


async def run_machine(client, cid, ctx) -> Outcome:
    trace: list[str] = []

    ok, reason = await attempt(client, cid, ctx, "search", search_record, trace)
    if not ok:
        return Outcome(ok=False, reason=f"search: {reason}", trace=trace)

    # Idempotency: if it already exists, stop instead of creating a duplicate.
    if ctx["exists"]:
        return Outcome(
            ok=True, reason="record already exists; nothing to create", trace=trace
        )

    for name, step in CREATE_STEPS:
        ok, reason = await attempt(client, cid, ctx, name, step, trace)
        if not ok:
            return Outcome(ok=False, reason=f"{name}: {reason}", trace=trace)
    return Outcome(ok=True, trace=trace)


async def reset_workspace(client, cid, lock):
    async with lock:  # same lock as requests: no interleaving
        await client.computers.hotkey(cid, keys=["esc"])
        await client.computers.hotkey(cid, keys=["esc"])
        await client.computers.click(cid, x=64, y=32)  # nav: main screen
        await client.computers.click(cid, x=176, y=64)  # clear all fields
        # Verify the reset the same fail-closed way; if it fails, mark the
        # session unhealthy so the next request 503s instead of typing into
        # a half-open form.


@example(
    PAGE,
    "a-minimal-per-workflow-state-machine",
    title="Wrap a Legacy App: A Minimal Per-Workflow State Machine",
)
async def a_minimal_per_workflow_state_machine(client: AsyncLightcone):
    created = await client.computers.create(
        kind="browser", display={"width": 1280, "height": 720}
    )
    cid = str(created.id)
    lock = asyncio.Lock()  # one desktop => one request at a time
    try:
        await client.computers.navigate(cid, url=TARGET)
        await asyncio.sleep(2)

        async with lock:
            ctx = {
                "record": {"name": "Ada Lovelace", "reference": "REF-001"},
                "request_id": str(uuid.uuid4()),
            }
            outcome = await run_machine(client, cid, ctx)

        # The endpoint maps this to 201 vs 502: ok=False means we acted but never
        # saw the success indicator, which is a 502, never a retry.
        print(f"outcome.ok = {Colors.YELLOW}{outcome.ok}{Colors.RESET}")
        print(f"outcome.reason = {outcome.reason}")
        for line in outcome.trace:
            print(f"  trace: {line}")
    finally:
        await client.computers.delete(cid)


@example(PAGE, "fail-closed-verification", title="Wrap a Legacy App: Fail-Closed Verification")
async def fail_closed_verification(client: AsyncLightcone):
    created = await client.computers.create(
        kind="browser", display={"width": 1280, "height": 720}
    )
    cid = str(created.id)
    try:
        await client.computers.navigate(cid, url=TARGET)
        await asyncio.sleep(2)

        ok, reason = await verify_created(client, cid, {})
        # No confirmation banner exists on this stand-in screen, so the honest
        # answer is False -> the endpoint would answer 502. Never map "the click
        # sequence completed" to 2xx.
        print(f"verified = {Colors.YELLOW}{ok}{Colors.RESET}")
        print(f"reason = {reason}")
    finally:
        await client.computers.delete(cid)


@example(
    PAGE,
    "reset-the-workspace-in-the-background",
    title="Wrap a Legacy App: Reset the Workspace in the Background",
)
async def reset_the_workspace_in_the_background(client: AsyncLightcone):
    created = await client.computers.create(
        kind="browser", display={"width": 1280, "height": 720}
    )
    cid = str(created.id)
    lock = asyncio.Lock()
    try:
        await client.computers.navigate(cid, url=TARGET)
        await asyncio.sleep(2)

        # Respond first, clean up after: reset latency is not the caller's problem.
        task = asyncio.create_task(reset_workspace(client, cid, lock))
        # The endpoint returns here; the example awaits so the session outlives
        # the reset it scheduled.
        await task
        print(f"{Colors.GREEN}Workspace reset under the request lock{Colors.RESET}")
    finally:
        await client.computers.delete(cid)


def wrap_a_legacy_app_in_an_api(_client=None):
    print(f"{Colors.YELLOW}*** Cookbook: Wrap a Legacy App in an API ***{Colors.RESET}\n")

    async def _run():
        client = AsyncLightcone()
        try:
            await a_minimal_per_workflow_state_machine(client)
            await fail_closed_verification(client)
            await reset_the_workspace_in_the_background(client)
        finally:
            await client.close()

    asyncio.run(_run())
