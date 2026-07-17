"""Cookbook: Verified structured extraction from screens.

The docs recipe reads a record-search screen in a legacy app. There is no such
app here, so the examples point at a real, bot-friendly page (the TodoMVC demo
the Playwright integration already uses) and read a row off it with the same
strict-JSON + verify-before-acting machinery. The extraction logic, the JSON
salvage, the confidence gate and the exact-match check are all exercised for
real; only the screen behind them is a stand-in.

A verification returning False is a legitimate result, not a failure.
"""

import asyncio
import json
import re

from tzafon import AsyncLightcone

from utils.example import example
from utils.term import Colors

PAGE = "cookbook/verified-structured-extraction"

MODEL = "tzafon.northstar-cua-fast-1.6"  # pin a version in production
# Illustrative gate. Calibrate against a labeled sample of your own screens;
# the right value depends on the model, the UI, and your tolerance for review.
MIN_CONFIDENCE = 0.6

TARGET = "https://demo.playwright.dev/todomvc/"

COMPUTER_USE_TOOL = {
    "type": "computer_use",
    "display_width": 1280,
    "display_height": 720,
    "environment": "browser",
}


def _output_text(resp) -> str:
    """Concatenate the text blocks of a Responses API result.

    DOCS BUG: the docs read `resp.output_text`. The Tzafon SDK's
    ResponseCreateResponse has no such property — that is an OpenAI SDK
    convenience. Walking `output` for message text is what the rest of this
    suite does (see auto/using_northstar/responses_api.py).
    """
    parts = []
    for item in resp.output or []:
        if getattr(item, "type", None) == "message":
            for block in item.content or []:
                if hasattr(block, "text") and block.text:
                    parts.append(block.text)
    return "".join(parts)


async def ask_screen(client: AsyncLightcone, image_url: str, question: str) -> str:
    """One screenshot, one question, text-only answer. No tools on purpose."""
    resp = await asyncio.wait_for(
        client.responses.create(
            model=MODEL,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_image", "image_url": image_url, "detail": "auto"},
                        {"type": "input_text", "text": question},
                    ],
                }
            ],
        ),
        timeout=45,
    )
    return _output_text(resp)


def json_from_model_text(text: str) -> dict:
    """Models love ```json fences. Strip them before parsing."""
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped, flags=re.I)
        stripped = re.sub(r"\s*```$", "", stripped)
    try:
        data = json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, flags=re.S)  # salvage embedded JSON
        if not match:
            raise ValueError(f"model did not return JSON: {text!r}")
        data = json.loads(match.group(0))
    if not isinstance(data, dict):
        raise ValueError(f"model JSON is not an object: {data!r}")
    return data


FIRST_ROW_PROMPT = (
    "You are looking at a record search screen. Read ONLY the first visible "
    "row inside the results list in the upper-right panel. Ignore the search "
    "input fields, filters, and labels outside that row. Return ONLY one JSON "
    "object with this exact shape:\n"
    '{"visible": boolean, "row_text": string|null, '
    '"first_name": string|null, "last_name": string|null, '
    '"birth_date": "YYYY-MM-DD"|null, "confidence": number}\n'
    "Result rows display as LAST FIRST DATE. For example, a row reading "
    '"Smith John 2000-Jan-01" means {"first_name":"John","last_name":"Smith",'
    '"birth_date":"2000-01-01"}. If no result row is visible, set '
    "visible=false and all text fields to null. Do not infer a row from the "
    "search filters."
)

DETAIL_PROMPT = (
    "Return ONLY one JSON object describing the visible detail panel with this "
    'exact shape: {"visible": boolean, "title": string|null, "confidence": number}'
)


def _norm(value) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").casefold())


async def _screenshot_url(client: AsyncLightcone, cid: str) -> str:
    shot = await client.computers.screenshot(cid)
    # DOCS BUG: the docs read `shot.result.screenshot_url`. ActionResult.result
    # is a plain dict — the SDK's own get_screenshot_url() does .result.get(...).
    url = (shot.result or {}).get("screenshot_url")
    if not url:
        raise RuntimeError(f"no screenshot_url in result: {shot.result!r}")
    return str(url)


async def select_verified_result(client, cid, first_name, last_name, birth_date):
    """Click the first search result only if it is visibly the exact record."""
    shot_url = await _screenshot_url(client, cid)
    row = json_from_model_text(await ask_screen(client, shot_url, FIRST_ROW_PROMPT))
    try:
        confidence = float(row.get("confidence") or 0)
    except (TypeError, ValueError):
        confidence = 0.0

    matches = (
        row.get("visible")
        and _norm(row.get("first_name")) == _norm(first_name)
        and _norm(row.get("last_name")) == _norm(last_name)
        and row.get("birth_date") == birth_date
    )
    if confidence < MIN_CONFIDENCE or not matches:
        return False, f"first result not verified as exact match; extracted={row!r}"

    await client.computers.click(cid, x=880, y=176)  # measured first-row position
    return True, ""


async def run_bounded_loop(client, cid, instruction, max_steps=6):
    """Bounded computer-use loop whose only goal is navigation.

    The docs reference this as `run_bounded_loop` / `run_recovery` without
    showing it — it is the standard CUA loop from the Responses API guide,
    with a hard step budget and a prompt that forbids side effects.
    """
    shot_url = await _screenshot_url(client, cid)
    resp = await client.responses.create(
        model=MODEL,
        tools=[COMPUTER_USE_TOOL],
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": instruction},
                    {"type": "input_image", "image_url": shot_url, "detail": "auto"},
                ],
            }
        ],
    )

    for _ in range(max_steps):
        call = next(
            (
                o
                for o in (resp.output or [])
                if (o.get("type") if isinstance(o, dict) else getattr(o, "type", None))
                == "computer_call"
            ),
            None,
        )
        if not call:
            return True
        action = call.get("action") if isinstance(call, dict) else call.action
        atype = action.get("type") if isinstance(action, dict) else action.type
        if atype in ("terminate", "done", "answer"):
            return True
        # Execute the action — see the CUA protocol guide for the full helper.
        await asyncio.sleep(1)
        shot_url = await _screenshot_url(client, cid)
        call_id = call.get("call_id") if isinstance(call, dict) else call.call_id
        resp = await client.responses.create(
            model=MODEL,
            previous_response_id=resp.id,
            tools=[COMPUTER_USE_TOOL],
            input=[
                {
                    "type": "computer_call_output",
                    "call_id": call_id,
                    "output": {
                        "type": "input_image",
                        "image_url": shot_url,
                        "detail": "auto",
                    },
                }
            ],
        )
    return False  # budget exhausted


@example(PAGE, "the-ask_screen-helper", title="Verified Extraction: The ask_screen Helper")
async def the_ask_screen_helper(client: AsyncLightcone):
    created = await client.computers.create(
        kind="browser", display={"width": 1280, "height": 720}
    )
    cid = str(created.id)
    try:
        await client.computers.navigate(cid, url=TARGET)
        await asyncio.sleep(2)

        shot_url = await _screenshot_url(client, cid)
        answer = await ask_screen(
            client, shot_url, "What is the main heading on this page? Answer in one word."
        )
        print(f"ask_screen answer: {Colors.YELLOW}{answer!r}{Colors.RESET}")

        # Fence-stripping is the belt-and-suspenders path. When the endpoint
        # supports it, a JSON schema via response_format constrains the model to
        # valid typed output and skips the salvage step. response_format lives on
        # Chat Completions, not the Responses API.
        completion = await client.chat.create_completion(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": shot_url}},
                        {"type": "text", "text": "Describe the main heading."},
                    ],
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "heading",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "heading": {"type": "string"},
                            "confidence": {"type": "number"},
                        },
                        "required": ["heading", "confidence"],
                        "additionalProperties": False,
                    },
                },
            },
        )
        print(f"response_format (json_schema) reply: {Colors.YELLOW}{completion}{Colors.RESET}")
    finally:
        await client.computers.delete(cid)


@example(
    PAGE,
    "prompt-for-an-exact-json-shape",
    title="Verified Extraction: Prompt for an Exact JSON Shape",
)
async def prompt_for_an_exact_json_shape(client: AsyncLightcone):
    created = await client.computers.create(
        kind="browser", display={"width": 1280, "height": 720}
    )
    cid = str(created.id)
    try:
        await client.computers.navigate(cid, url=TARGET)
        await asyncio.sleep(2)

        shot_url = await _screenshot_url(client, cid)
        raw = await ask_screen(client, shot_url, FIRST_ROW_PROMPT)
        row = json_from_model_text(raw)  # fences stripped before json.loads
        print(f"extracted: {Colors.YELLOW}{row!r}{Colors.RESET}")
        # No result row exists on this stand-in screen, so a well-behaved model
        # answers visible=false. That is the prompt working, not failing.
        print(f"visible = {Colors.YELLOW}{row.get('visible')}{Colors.RESET}")
    finally:
        await client.computers.delete(cid)


@example(PAGE, "verify-before-acting", title="Verified Extraction: Verify Before Acting")
async def verify_before_acting(client: AsyncLightcone):
    created = await client.computers.create(
        kind="browser", display={"width": 1280, "height": 720}
    )
    cid = str(created.id)
    try:
        await client.computers.navigate(cid, url=TARGET)
        await asyncio.sleep(2)

        ok, reason = await select_verified_result(client, cid, "John", "Smith", "2000-01-01")
        # Fail closed: the extraction is an input to a decision, never the
        # decision. No exact match here => no click, and the extracted row is
        # attached to the reason so a wrong extraction is cheap to debug.
        print(f"selected: {Colors.YELLOW}{ok}{Colors.RESET}")
        print(f"reason: {reason}")
    finally:
        await client.computers.delete(cid)


@example(
    PAGE,
    "two-phase-trick-explore-with-tools-extract-without",
    title="Verified Extraction: Two-Phase Explore/Extract",
)
async def two_phase_explore_then_extract(client: AsyncLightcone):
    created = await client.computers.create(
        kind="browser", display={"width": 1280, "height": 720}
    )
    cid = str(created.id)
    try:
        await client.computers.navigate(cid, url=TARGET)
        await asyncio.sleep(2)

        await run_bounded_loop(  # phase 1: tools on, answer off
            client,
            cid,
            "Open the detail view for the currently selected record. "
            "Stop when the detail panel is fully visible. Do not modify anything.",
            max_steps=6,
        )
        shot_url = await _screenshot_url(client, cid)
        detail = json_from_model_text(  # phase 2: tools off, JSON only
            await ask_screen(client, shot_url, DETAIL_PROMPT)
        )
        # Log both together: the JSON and the exact screenshot it came from.
        print(f"screenshot: {Colors.BLUE}{shot_url}{Colors.RESET}")
        print(f"detail: {Colors.YELLOW}{detail!r}{Colors.RESET}")
    finally:
        await client.computers.delete(cid)


def verified_structured_extraction(_client=None):
    print(f"{Colors.YELLOW}*** Cookbook: Verified Structured Extraction ***{Colors.RESET}\n")

    async def _run():
        client = AsyncLightcone()
        try:
            await the_ask_screen_helper(client)
            await prompt_for_an_exact_json_shape(client)
            await verify_before_acting(client)
            await two_phase_explore_then_extract(client)
        finally:
            await client.close()

    asyncio.run(_run())
