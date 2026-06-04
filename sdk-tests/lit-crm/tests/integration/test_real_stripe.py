"""End-to-end integration tests against the REAL Tzafon Lightcone API + Stripe.

These hit the network and require:

* ``TZAFON_API_KEY`` in the environment (or ``.env``), and
* a previously-saved Stripe session, created once with::

      APP=stripe uv run lit-crm-login

The whole module is marked ``integration`` and auto-skips when no API key is
present, so it never runs in the network-free CI unit suite (the project's
``addopts = -m 'not integration'`` also deselects it by default). Run it
explicitly with::

    uv run pytest -m integration tests/integration -q

These are intentionally written as real-but-guarded scaffolds: they document the
two highest-value end-to-end paths (session resume + a capability run) and will
``skip`` cleanly rather than fail when prerequisites are missing.
"""

from __future__ import annotations

import os

import pytest

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        os.getenv("TZAFON_API_KEY") is None,
        reason="TZAFON_API_KEY not set; skipping real Lightcone integration tests",
    ),
]

APP = "stripe"
#: The login success token from ``profiles/stripe.yaml`` (login.success_check).
LOGIN_TOKEN = "Payments"


def _config():
    from lit_crm.config import load_config

    return load_config(APP)


def _require_saved_session():
    """Skip (don't fail) if ``lit-crm-login`` has not been run for Stripe yet."""
    from lit_crm.session import SessionManager
    from lit_crm.lightcone_client import build_client

    cfg = _config()
    mgr = SessionManager(build_client(), cfg.session_dir)
    if mgr.load(APP) is None:
        pytest.skip(
            f"No saved {APP!r} session. Run `APP={APP} uv run lit-crm-login` first."
        )
    return cfg, mgr


def test_resume_saved_session_is_authenticated():
    """Resuming the saved session should land on an authenticated page."""
    from lit_crm.login import verify_login
    from lit_crm.profile import load_profile

    cfg, mgr = _require_saved_session()
    profile = load_profile(APP, cfg.profiles_dir)

    with mgr.resume(APP) as computer:
        computer.navigate(profile.base_url)
        computer.wait(3)
        html = computer.get_html_content(computer.html())

    assert verify_login(profile.login.success_check, html, computer), (
        f"resumed session does not look authenticated; expected {LOGIN_TOKEN!r} in page"
    )
    assert LOGIN_TOKEN in html


def test_find_overdue_invoices_end_to_end():
    """Run the read-only ``find_overdue_invoices`` capability for real.

    Asserts the structured ``extracted`` shape: a JSON list of overdue invoices,
    each a mapping with the documented keys. The list may be empty for an account
    with no overdue invoices — that is still a valid (successful) shape.
    """
    from lit_crm.engine import ActEngine
    from lit_crm.profile import load_profile
    from lit_crm.server import run_capability

    cfg, mgr = _require_saved_session()
    profile = load_profile(APP, cfg.profiles_dir)
    engine = ActEngine(
        mgr.client,
        max_steps=profile.defaults.max_steps,
        step_wait_seconds=profile.defaults.step_wait_seconds,
    )

    result = run_capability(
        profile,
        "find_overdue_invoices",
        mgr,
        engine,
        limit=5,
    )

    assert result["status"] in {"success", "max_steps"}
    extracted = result["extracted"]
    assert isinstance(extracted, list)
    for row in extracted:
        assert isinstance(row, dict)
        assert {"customer", "amount", "due_date", "days_overdue"} <= set(row)
