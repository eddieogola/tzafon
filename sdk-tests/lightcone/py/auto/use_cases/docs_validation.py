"""Using Northstar to validate documentation.

https://docs.lightcone.ai/use-cases/docs-validation/

Two deliberate deviations from the page, both about coordinates — which is
awkward, because coordinates are the entire subject of the page:

1. The page's example 1 prints `item.action.x` / `item.action.y` straight from
   the response. Those are 0-999 model space (see `utils/coords`), but example 2
   feeds pixel coordinates to `computer.click()`. Copy example 1's output into
   example 2 as the page tells you to and you click the wrong part of the screen.
   We denormalize with `to_px` before printing, so the healed numbers are in the
   space the next example actually consumes.

2. The page hardcodes example 2's coordinates. A docs-validation page that
   hardcodes coordinates has the same rot it exists to cure, so example 1's
   discovered coordinates are threaded into example 2 via module state — the
   `SESSION_ID` pattern from `auto/tutorials/login_scrape.py`. The page's
   literals stay as `DOCS_COORDS`, used only when example 2 runs standalone.
   Then the assert in example 2 is a real test of the healing loop rather than a
   test of three numbers someone typed in 2026.
"""

from utils.coords import DISPLAY_HEIGHT, DISPLAY_WIDTH, to_px
from utils.example import example
from utils.term import Colors

PAGE = "use-cases/docs-validation"

TOOL = {
    "type": "computer_use",
    "display_width": DISPLAY_WIDTH,
    "display_height": DISPLAY_HEIGHT,
    "environment": "browser",
}

# The page's example 1 iterates a plain list and prints the element name. We key
# the same descriptions so the discovered pixels can be threaded into example 2.
ELEMENTS = {
    "username": "username input field",
    "password": "password input field",
    "login": "Login button",
}

# The page's example 2 literals. Fallback only — see the module docstring.
DOCS_COORDS = {
    "username": (189, 163),
    "password": (189, 246),
    "login": (93, 302),
}

# Populated by self_heal_coordinate_dependent_examples, consumed by
# verify_the_fix_end_to_end. Pixels, already denormalized.
HEALED_COORDS: dict[str, tuple[int, int]] = {}


def _action(item):
    """Return a computer_call's action as a dict, whatever shape it arrives in.

    `responses.create` is typed from OpenAI's schema, which has no `computer_use`
    tool, so `computer_call` items deserialize as plain dicts in some responses
    and as models in others — the suite has both spellings already
    (`using_northstar/responses_api.py` vs `using_northstar/cua_protocol.py`).
    Reading the field either way keeps a shape change from looking like "the
    model found nothing".
    """
    if isinstance(item, dict):
        if item.get("type") != "computer_call":
            return None
        return item.get("action") or {}
    if getattr(item, "type", None) != "computer_call":
        return None
    action = getattr(item, "action", None)
    if action is None:
        return None
    return action if isinstance(action, dict) else vars(action)


@example(
    PAGE,
    "self-heal-coordinate-dependent-examples",
    title="Self-heal Coordinate-dependent Examples",
)
def self_heal_coordinate_dependent_examples(client):
    HEALED_COORDS.clear()

    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://quotes.toscrape.com/login")
        computer.wait(2)
        screenshot_url = computer.get_screenshot_url(computer.screenshot())

        for key, element in ELEMENTS.items():
            response = client.responses.create(
                model="tzafon.northstar-cua-fast-1.6",
                tools=[TOOL],
                input=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": f"Click the {element}"},
                            {
                                "type": "input_image",
                                "image_url": screenshot_url,
                                "detail": "auto",
                            },
                        ],
                    }
                ],
            )

            for item in response.output or []:
                action = _action(item)
                if action is None:
                    continue
                # The page prints action.x/action.y raw. They are 0-999 model
                # space; example 2 clicks pixels. Denormalize or the healed
                # numbers are wrong in exactly the way this page warns about.
                x = to_px(action["x"], DISPLAY_WIDTH)
                y = to_px(action["y"], DISPLAY_HEIGHT)
                HEALED_COORDS[key] = (x, y)
                print(
                    f"{element}: model ({action['x']}, {action['y']}) "
                    f"-> pixel ({x}, {y})"
                )
                break

    missing = [e for k, e in ELEMENTS.items() if k not in HEALED_COORDS]
    if missing:
        raise Exception(f"No coordinates returned for: {', '.join(missing)}")

    for key, (x, y) in HEALED_COORDS.items():
        drift_x = x - DOCS_COORDS[key][0]
        drift_y = y - DOCS_COORDS[key][1]
        print(f"{key}: drift vs docs literal ({drift_x:+d}, {drift_y:+d})")


@example(PAGE, "verify-the-fix-end-to-end", title="Verify the Fix End-to-end")
def verify_the_fix_end_to_end(client):
    if HEALED_COORDS:
        coords = HEALED_COORDS
        print(f"{Colors.YELLOW}Using healed coordinates{Colors.RESET}")
    else:
        # Standalone run — no healing pass to draw on, so use the page's numbers.
        coords = DOCS_COORDS
        print(f"{Colors.YELLOW}Using the docs' hardcoded coordinates{Colors.RESET}")

    with client.computer.create(kind="browser") as computer:
        computer.navigate("https://quotes.toscrape.com/login")
        computer.wait(2)

        computer.click(*coords["username"])
        computer.type("scraper")
        computer.click(*coords["password"])
        computer.type("password")
        computer.click(*coords["login"])
        computer.wait(2)

        html = computer.get_html_content(computer.html())
        assert html and "Logout" in html, "Login failed; coordinates may still be wrong"
        print(f"{Colors.GREEN}Verified: tutorial works with healed coordinates{Colors.RESET}")


@example(
    PAGE,
    "let-northstar-run-the-tutorial-itself",
    title="Let Northstar Run the Tutorial Itself",
)
def let_northstar_run_the_tutorial_itself(client):
    for event in client.agent.tasks.start_stream(
        instruction=(
            "Go to https://quotes.toscrape.com/login. "
            "Log in with username 'scraper' and password 'password'. "
            "After logging in, verify you can see quotes on the page. "
            "Report whether the login succeeded and what quotes you see."
        ),
        kind="browser",
        max_steps=15,
    ):
        print(event)


def docs_validation(client):
    print(f"{Colors.YELLOW}*** Documentation Validation Use Cases ***{Colors.RESET}\n")
    self_heal_coordinate_dependent_examples(client)
    verify_the_fix_end_to_end(client)
    let_northstar_run_the_tutorial_itself(client)
