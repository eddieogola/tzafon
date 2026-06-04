"""Tests for the FastMCP server slice: dynamic tool registration + confirmation guard."""

from __future__ import annotations

from lit_crm.engine import ActResult
from lit_crm.server import build_server, registered_tool_names, run_capability

from tests.fakes import FakeEngine, FakeSessionManager


def _tool_by_name(server, name):
    for t in server._tool_manager.list_tools():
        if t.name == name:
            return t
    raise AssertionError(f"tool {name!r} not registered")


def test_registers_one_tool_per_capability_plus_status(stripe_profile):
    server = build_server(
        stripe_profile,
        FakeSessionManager(sessions={"stripe": "env_1"}),
        FakeEngine(),
    )
    assert registered_tool_names(server) == {
        "find_overdue_invoices",
        "email_overdue_customers",
        "status",
    }


def test_synthesized_signatures_expose_params(stripe_profile):
    server = build_server(
        stripe_profile,
        FakeSessionManager(sessions={"stripe": "env_1"}),
        FakeEngine(),
    )
    find = _tool_by_name(server, "find_overdue_invoices")
    assert "limit" in find.parameters["properties"]

    email = _tool_by_name(server, "email_overdue_customers")
    props = email.parameters["properties"]
    assert "confirm" in props
    # confirm is required (no default) per the profile.
    assert "confirm" in email.parameters.get("required", [])


def test_confirmation_guard_blocks_without_confirm(stripe_profile):
    engine = FakeEngine()
    result = run_capability(
        stripe_profile,
        "email_overdue_customers",
        FakeSessionManager(sessions={"stripe": "e"}),
        engine,
        max_customers=5,
    )
    assert result["status"] == "needs_confirmation"
    assert engine.runs == []


def test_confirmation_guard_passes_with_confirm(stripe_profile):
    engine = FakeEngine(ActResult(status="success", steps_taken=2, summary="sent"))
    result = run_capability(
        stripe_profile,
        "email_overdue_customers",
        FakeSessionManager(sessions={"stripe": "e"}),
        engine,
        confirm=True,
        max_customers=5,
    )
    assert len(engine.runs) == 1
    assert result == engine.result.to_mcp_dict()
    assert result["status"] == "success"


def test_find_overdue_renders_instruction_and_navigates(stripe_profile):
    engine = FakeEngine()
    sm = FakeSessionManager(sessions={"stripe": "e"})
    result = run_capability(
        stripe_profile,
        "find_overdue_invoices",
        sm,
        engine,
        limit=10,
    )
    assert result["status"] == "success"
    assert len(engine.runs) == 1
    assert "10" in engine.runs[0]["instruction"]
    # the resumed computer was navigated.
    assert any(name == "navigate" for name, _ in sm._computer.calls)


def test_no_session_returns_login_error(stripe_profile):
    engine = FakeEngine()
    result = run_capability(
        stripe_profile,
        "find_overdue_invoices",
        FakeSessionManager(sessions={}),
        engine,
        limit=10,
    )
    assert result["status"] == "error"
    assert "login" in result["error"].lower()
    assert engine.runs == []


def test_missing_capability_raises(stripe_profile):
    import pytest

    with pytest.raises((KeyError, ValueError)):
        run_capability(
            stripe_profile,
            "does_not_exist",
            FakeSessionManager(sessions={"stripe": "e"}),
            FakeEngine(),
        )


def test_status_tool_reports_logged_in(stripe_profile):
    server_in = build_server(
        stripe_profile,
        FakeSessionManager(sessions={"stripe": "env_1"}),
        FakeEngine(),
    )
    status_fn = _tool_by_name(server_in, "status").fn
    res_in = status_fn()
    assert res_in["app"] == "stripe"
    assert res_in["logged_in"] is True
    assert set(res_in["capabilities"]) == {"find_overdue_invoices", "email_overdue_customers"}

    server_out = build_server(
        stripe_profile,
        FakeSessionManager(sessions={}),
        FakeEngine(),
    )
    status_fn_out = _tool_by_name(server_out, "status").fn
    assert status_fn_out()["logged_in"] is False
