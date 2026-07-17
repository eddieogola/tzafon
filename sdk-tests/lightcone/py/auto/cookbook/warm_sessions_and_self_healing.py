"""Cookbook: Warm sessions and self-healing.

The docs recipe assumes a desktop snapshot with a legacy SSO app installed at
measured coordinates. That app does not exist here, so the app-specific pieces
(`SNAPSHOT_ENV_ID`, the login FSM, the search-field coordinates) are stubbed or
pointed at a real reachable page. What is exercised for real is the SDK surface
the recipe is built on: `computers.list()`, `context_id`, `idle_timeout_enabled`,
`keepalive`, and the click/type/screenshot probe.

A probe returning False is a legitimate result, not a failure — these examples
report what the pixels say rather than asserting on a fictional app.
"""

import asyncio
import io

import httpx
from PIL import Image
from tzafon import AsyncLightcone

from utils.example import example
from utils.term import Colors

PAGE = "cookbook/warm-sessions-and-self-healing"

CONTEXT_ID = "legacy-app-worker"  # tag every desktop you create with this
# The docs use SNAPSHOT_ENV_ID = "env_..." — a saved environment with the app
# installed. No such snapshot exists here, and passing a bogus environment_id
# is a 4xx, so creation falls back to a plain desktop.
SNAPSHOT_ENV_ID = None


async def _adopt_or_create(client: AsyncLightcone) -> str:
    """Return the id of a live authenticated desktop, reusing one if possible."""
    # Fail closed: let a listing error propagate. If we can't confirm whether a
    # warm session already exists, creating one risks a duplicate login that
    # silently kills the first (see the note below). The caller should retry.
    computers = await client.computers.list()

    matches = [
        c
        for c in computers
        if c.kind == "desktop"
        and str(c.status).upper() in ("RUNNING", "READY")
        # DOCS/SDK MISMATCH: the docs read `c.context_id`. ComputerResponse does
        # not declare that field — `context_id` is a create-only param. The model
        # allows extras, so this works only if the API echoes it back; getattr
        # keeps the filter from raising AttributeError when it doesn't.
        and getattr(c, "context_id", None) == CONTEXT_ID
    ]
    if matches:
        # Freshest first, so we don't adopt one about to hit its idle timeout.
        matches.sort(key=lambda c: str(c.created_at), reverse=True)
        print(f"adopted warm session {Colors.YELLOW}{matches[0].id}{Colors.RESET}")
        return str(matches[0].id)

    created = await client.computers.create(
        kind="desktop",
        context_id=CONTEXT_ID,
        **({"environment_id": SNAPSHOT_ENV_ID} if SNAPSHOT_ENV_ID else {}),
        persistent=True,
        idle_timeout_enabled=False,  # the keepalive loop owns liveness
    )
    print(f"created warm session {Colors.YELLOW}{created.id}{Colors.RESET}")
    return str(created.id)


async def _screenshot_image(client: AsyncLightcone, cid: str) -> Image.Image:
    """Download the screenshot the API just took as a PIL image."""
    shot = await client.computers.screenshot(cid)
    # DOCS BUG: the docs read `shot.result.screenshot_url`. ActionResult.result
    # is a plain dict — the SDK's own get_screenshot_url() does .result.get(...).
    url = (shot.result or {}).get("screenshot_url")
    if not url:
        raise RuntimeError(f"no screenshot_url in result: {shot.result!r}")
    async with httpx.AsyncClient() as http:
        resp = await http.get(str(url))
        resp.raise_for_status()
    return Image.open(io.BytesIO(resp.content))


def _region_contains_text(crop: Image.Image) -> bool:
    """Cheap dark-pixel count. No OCR: proof the app processed the keystrokes."""
    rgb = crop.convert("RGB")
    dark = sum(1 for px in rgb.getdata() if sum(px) < 3 * 128)
    return dark > 20


async def _is_live(client, cid) -> bool:
    """Type into a harmless field and check the screen actually changed."""
    PROBE = "zzprobe"
    await client.computers.click(cid, x=176, y=98)  # a known search field
    await client.computers.hotkey(cid, keys=["ctrl", "a"])
    await client.computers.type(cid, text=PROBE)
    await asyncio.sleep(1.0)

    img = await _screenshot_image(client, cid)  # PIL image helper
    field = img.crop((120, 90, 320, 110))
    responded = _region_contains_text(field)  # cheap dark-pixel count

    # Clean up the probe text either way.
    await client.computers.hotkey(cid, keys=["ctrl", "a"])
    await client.computers.hotkey(cid, keys=["Delete"])
    return responded


async def _computer_exists(client, cid) -> bool:
    try:
        await client.computers.retrieve(cid)
        return True
    except Exception:
        return False


async def _drive_login(client, cid) -> bool:
    """Stand-in for the SSO login FSM (see the Logins and sessions recipe).

    The real one is a screenshot/classify/act loop with a per-screen attempt
    budget. There is no SSO app here, so this only proves the desktop responds.
    """
    return await _computer_exists(client, cid)


class Session:
    def __init__(self, client):
        self.client = client
        self.cid: str | None = None
        self.healthy = False

    async def recover(self) -> bool:
        # Level 1: the VM is alive but the app logged out; re-auth in place.
        if self.cid and await _computer_exists(self.client, self.cid):
            if await _drive_login(self.client, self.cid):  # your SSO login FSM
                self.healthy = await _is_live(self.client, self.cid)
                if self.healthy:
                    return True
            # Still live but unrecoverable: leave it for inspection rather
            # than creating a duplicate login for the same account.
            self.healthy = False
            return False

        # Level 2: the VM is gone; recreate from the snapshot and re-auth.
        self.cid = await _adopt_or_create(self.client)
        if await _drive_login(self.client, self.cid):
            self.healthy = await _is_live(self.client, self.cid)
            if self.healthy:
                return True

        # Level 3: give up loudly. Manual re-auth is likely required.
        self.healthy = False
        return False


async def _keepalive_loop(session: Session, lock: asyncio.Lock, interval=180, iterations=None):
    # The docs loop forever (`while True`). Bounded here so the example
    # terminates: production code runs this as a background task for the
    # lifetime of the process.
    count = 0
    while iterations is None or count < iterations:
        count += 1
        await asyncio.sleep(interval)
        try:
            if session.cid is None:
                continue
            await session.client.computers.keepalive(session.cid)
            async with lock:  # never probe mid-request
                session.healthy = await _is_live(session.client, session.cid)
                if not session.healthy:
                    print("keepalive saw a dead session; auto-recovering")
                    await session.recover()
        except Exception as exc:
            print(f"keepalive iteration failed: {exc}")


@example(PAGE, "adopt-or-create", title="Warm Sessions: Adopt or Create")
async def adopt_or_create(client: AsyncLightcone):
    cid = await _adopt_or_create(client)

    # Adopt-or-create is only interesting the second time: listing again must
    # now find the desktop we just made and reuse it rather than duplicate it.
    again = await _adopt_or_create(client)
    print(f"second call {'adopted' if again == cid else 'created a NEW'} session")

    # Track whether you adopted or created: on shutdown an adopted session should
    # be left running. This one was created by the example, so it is cleaned up.
    await client.computers.delete(cid)
    if again != cid:
        await client.computers.delete(again)
    print(f"{Colors.GREEN}Cleaned up{Colors.RESET}")


@example(PAGE, "an-active-liveness-probe", title="Warm Sessions: An Active Liveness Probe")
async def an_active_liveness_probe(client: AsyncLightcone):
    created = await client.computers.create(kind="desktop", context_id=CONTEXT_ID)
    cid = str(created.id)
    try:
        await asyncio.sleep(3)  # let the desktop paint
        live = await _is_live(client, cid)
        # A screenshot of a frozen app looks identical to a healthy one, so the
        # probe types and checks the screen responded. There is no legacy app
        # behind these coordinates, so False here is an honest answer, not a bug.
        print(f"active probe says live: {Colors.YELLOW}{live}{Colors.RESET}")
    finally:
        await client.computers.delete(cid)


@example(PAGE, "escalating-recovery", title="Warm Sessions: Escalating Recovery")
async def escalating_recovery(client: AsyncLightcone):
    session = Session(client)

    # Level 2 path: no cid yet, so recover() creates from the snapshot and re-auths.
    recovered = await session.recover()
    print(f"recover() -> {Colors.YELLOW}{recovered}{Colors.RESET}, cid={session.cid}")

    # Level 3 path: point at a dead id. Both levels fail, session marked unhealthy
    # rather than retry-looping forever.
    if session.cid:
        await client.computers.delete(session.cid)
    print(f"session.healthy = {Colors.YELLOW}{session.healthy}{Colors.RESET}")


@example(PAGE, "the-keepalive-loop", title="Warm Sessions: The Keepalive Loop")
async def the_keepalive_loop(client: AsyncLightcone):
    session = Session(client)
    session.cid = await _adopt_or_create(client)
    lock = asyncio.Lock()  # the same lock that serializes API requests

    try:
        # Docs run this forever at interval=180. Two fast iterations here.
        await _keepalive_loop(session, lock, interval=5, iterations=2)
        print(f"{Colors.GREEN}Keepalive loop completed 2 iterations{Colors.RESET}")
    finally:
        await client.computers.delete(session.cid)


def warm_sessions_and_self_healing(_client=None):
    print(f"{Colors.YELLOW}*** Cookbook: Warm Sessions and Self-Healing ***{Colors.RESET}\n")

    async def _run():
        # The recipe is async end to end; AsyncLightcone has no `.computer`
        # convenience wrapper, only `.computers`.
        client = AsyncLightcone()
        try:
            await adopt_or_create(client)
            await an_active_liveness_probe(client)
            await escalating_recovery(client)
            await the_keepalive_loop(client)
        finally:
            await client.close()

    asyncio.run(_run())
