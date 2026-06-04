"""Tests for the persistent-session manager slice."""

from __future__ import annotations

from pathlib import Path

import pytest

from lit_crm.session import NoSessionError, SessionManager

from .fakes import FakeLightcone


def test_save_then_load_round_trips_environment_id(fake_client: FakeLightcone, session_dir: Path) -> None:
    mgr = SessionManager(fake_client, session_dir)
    mgr.save("stripe", "env_123")
    assert mgr.load("stripe") == "env_123"


def test_load_returns_none_when_no_file(fake_client: FakeLightcone, session_dir: Path) -> None:
    mgr = SessionManager(fake_client, session_dir)
    assert mgr.load("nope") is None


def test_resume_calls_create_with_environment_id(fake_client: FakeLightcone, session_dir: Path) -> None:
    mgr = SessionManager(fake_client, session_dir)
    mgr.save("stripe", "env_123")

    with mgr.resume("stripe") as session:
        assert session is fake_client.fake_computer

    assert fake_client.create_calls == [{"kind": "browser", "environment_id": "env_123"}]


def test_resume_without_saved_session_raises(fake_client: FakeLightcone, session_dir: Path) -> None:
    mgr = SessionManager(fake_client, session_dir)
    with pytest.raises(NoSessionError):
        with mgr.resume("stripe"):
            pass


def test_create_persistent_calls_create_with_persistent_true(
    fake_client: FakeLightcone, session_dir: Path
) -> None:
    mgr = SessionManager(fake_client, session_dir)
    with mgr.create_persistent() as session:
        assert session is fake_client.fake_computer

    assert fake_client.create_calls == [{"kind": "browser", "persistent": True}]


def test_save_persists_to_disk_across_instances(fake_client: FakeLightcone, session_dir: Path) -> None:
    SessionManager(fake_client, session_dir).save("stripe", "env_123", base_url="https://stripe.com")

    # A brand-new manager reading the same store dir sees the saved id.
    assert SessionManager(fake_client, session_dir).load("stripe") == "env_123"
    assert (session_dir / "stripe.json").exists()
