"""One-time interactive login that saves a persistent authenticated session.

CONTRACT STUB — ``login_main`` is the frozen console-script entrypoint and
``verify_login`` is the reusable success-check evaluator. The login slice fills
in the bodies.

We never type or store credentials: a human completes login + 2FA in the live
browser, then we verify and persist only the opaque ``environment_id``.
"""

from __future__ import annotations

import re
from typing import Any, Callable

from .profile import (
    AnswerMatches,
    HtmlAbsent,
    HtmlContains,
    ModelTerminated,
    Profile,
    SuccessCheck,
    UrlContains,
)

_DEFAULT_INSTRUCTIONS = (
    "Complete login (and any 2FA) in the live browser window, wait until the\n"
    "authenticated home page is visible, then press ENTER here to continue."
)


def verify_login(success_check: SuccessCheck, html_content: str, computer: Any) -> bool:
    """Evaluate a profile ``success_check`` to confirm we are authenticated.

    Dispatch on the concrete type so a freshly-constructed model *or* one that
    only carries a ``.type`` discriminator both work.
    """
    html = html_content or ""

    if isinstance(success_check, HtmlContains):
        return success_check.value in html
    if isinstance(success_check, HtmlAbsent):
        return success_check.value not in html
    if isinstance(success_check, ModelTerminated):
        return True
    if isinstance(success_check, AnswerMatches):
        return re.search(success_check.pattern, html) is not None
    if isinstance(success_check, UrlContains):
        # Best-effort: we only have HTML here, so look in the document.
        return success_check.value in html

    # Fallback to the discriminator if it isn't one of the concrete classes.
    check_type = getattr(success_check, "type", None)
    if check_type == "html_contains":
        return getattr(success_check, "value", "") in html
    if check_type == "html_absent":
        return getattr(success_check, "value", "") not in html
    if check_type == "model_terminated":
        return True
    if check_type == "answer_matches":
        return re.search(getattr(success_check, "pattern", ""), html) is not None
    if check_type == "url_contains":
        return getattr(success_check, "value", "") in html
    return False


def _run_login(
    profile: Profile,
    mgr: Any,
    *,
    prompt: Callable[[str], str] = input,
) -> None:
    """Drive the interactive login against an already-built session manager.

    Factored out of :func:`login_main` so it can be tested with a fake session
    manager and an injected ``prompt`` (no real browser, no ``input()``).
    """
    with mgr.create_persistent() as computer:
        start_url = profile.login.start_url or profile.base_url
        computer.navigate(start_url)
        computer.wait(2)

        instructions = profile.login.instructions or _DEFAULT_INSTRUCTIONS
        print(f"\n[{profile.display_name}] one-time login")
        print(instructions)

        shot_url = computer.get_screenshot_url(computer.screenshot())
        print(f"\nLive browser: {shot_url}")

        prompt("\nPress ENTER once you have finished logging in... ")

        html = computer.get_html_content(computer.html())
        if verify_login(profile.login.success_check, html, computer):
            mgr.save(profile.app, computer.id, base_url=profile.base_url)
            print(f"\nLogin verified. Saved session for {profile.app!r}.")
        else:
            print(
                f"\nLogin could NOT be verified for {profile.app!r} "
                "(success check did not match). Nothing was saved.\n"
                "Re-run the login and make sure you reach the authenticated home page."
            )
            raise SystemExit(1)


def login_main() -> None:
    """Console-script entrypoint: ``APP=<app> lit-crm-login``."""
    # Imported lazily so unit tests can monkeypatch these seams cheaply.
    from .config import load_config
    from .lightcone_client import build_client
    from .profile import load_profile
    from .session import SessionManager

    cfg = load_config()
    profile = load_profile(cfg.app, cfg.profiles_dir)
    client = build_client()
    mgr = SessionManager(client, cfg.session_dir)
    _run_login(profile, mgr)
