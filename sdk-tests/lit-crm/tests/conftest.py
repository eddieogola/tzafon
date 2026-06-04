"""Shared pytest fixtures for lit-crm."""

from __future__ import annotations

from pathlib import Path

import pytest

from lit_crm.profile import Profile, load_profile

from .fakes import FakeComputer, FakeLightcone, FakeResponses

PROFILES_DIR = Path(__file__).resolve().parents[1] / "profiles"


@pytest.fixture
def profiles_dir() -> Path:
    return PROFILES_DIR


@pytest.fixture
def stripe_profile() -> Profile:
    return load_profile("stripe", PROFILES_DIR)


@pytest.fixture
def fake_computer() -> FakeComputer:
    return FakeComputer()


@pytest.fixture
def fake_responses() -> FakeResponses:
    return FakeResponses()


@pytest.fixture
def fake_client(fake_computer: FakeComputer, fake_responses: FakeResponses) -> FakeLightcone:
    return FakeLightcone(responses=fake_responses, computer=fake_computer)


@pytest.fixture
def session_dir(tmp_path: Path) -> Path:
    d = tmp_path / "sessions"
    d.mkdir(parents=True, exist_ok=True)
    return d
