"""Unit tests for the one-time interactive login slice.

``verify_login`` is pure and fully testable. ``_run_login`` is exercised against a
:class:`FakeSessionManager` + :class:`FakeComputer` with an injected prompt, so no
browser, network, or real ``input()`` is involved.
"""

from __future__ import annotations

import pytest

from lit_crm.login import _run_login, verify_login
from lit_crm.profile import (
    AnswerMatches,
    HtmlAbsent,
    HtmlContains,
    ModelTerminated,
    Profile,
    UrlContains,
)

from .fakes import FakeComputer, FakeSessionManager


# --- verify_login: one pass + one fail case per SuccessCheck variant --------


def test_html_contains_pass():
    check = HtmlContains(type="html_contains", value="Payments")
    assert verify_login(check, "<h1>Payments overview</h1>", computer=None) is True


def test_html_contains_fail():
    check = HtmlContains(type="html_contains", value="Payments")
    assert verify_login(check, "<h1>Login</h1>", computer=None) is False


def test_html_absent_pass():
    check = HtmlAbsent(type="html_absent", value="Sign in")
    assert verify_login(check, "<h1>Dashboard</h1>", computer=None) is True


def test_html_absent_fail():
    check = HtmlAbsent(type="html_absent", value="Sign in")
    assert verify_login(check, "<button>Sign in</button>", computer=None) is False


def test_model_terminated_always_true():
    check = ModelTerminated(type="model_terminated")
    assert verify_login(check, "", computer=None) is True
    assert verify_login(check, "anything at all", computer=None) is True


def test_answer_matches_pass():
    check = AnswerMatches(type="answer_matches", pattern=r"acct_\w+")
    assert verify_login(check, "id: acct_12AB present", computer=None) is True


def test_answer_matches_fail():
    check = AnswerMatches(type="answer_matches", pattern=r"acct_\w+")
    assert verify_login(check, "no account id here", computer=None) is False


def test_url_contains_pass():
    check = UrlContains(type="url_contains", value="/dashboard")
    assert verify_login(check, "canonical: https://x/dashboard/home", computer=None) is True


def test_url_contains_fail():
    check = UrlContains(type="url_contains", value="/dashboard")
    assert verify_login(check, "https://x/login", computer=None) is False


# --- _run_login: happy path + failure path ----------------------------------


def test_run_login_happy_path_saves_session(stripe_profile: Profile):
    computer = FakeComputer(session_id="env_live_42", html_content="<h1>Payments</h1>")
    mgr = FakeSessionManager(computer=computer)

    _run_login(stripe_profile, mgr, prompt=lambda _msg="": "")

    assert mgr.saved == [("stripe", "env_live_42")]
    # It actually navigated to the configured login URL and read HTML.
    assert computer.navigated_urls == [stripe_profile.login.start_url]
    assert computer.did("html")
    assert computer.did("screenshot")


def test_run_login_failure_does_not_save_and_exits(stripe_profile: Profile):
    # HTML lacks the "Payments" success token -> verification fails.
    computer = FakeComputer(session_id="env_live_99", html_content="<h1>Please sign in</h1>")
    mgr = FakeSessionManager(computer=computer)

    with pytest.raises(SystemExit) as excinfo:
        _run_login(stripe_profile, mgr, prompt=lambda _msg="": "")

    assert excinfo.value.code == 1
    assert mgr.saved == []
