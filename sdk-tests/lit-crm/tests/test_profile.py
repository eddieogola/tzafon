"""Tests for profile loading + validation (foundation module)."""

from __future__ import annotations

import textwrap
from pathlib import Path

import pytest

from lit_crm.profile import HtmlContains, ProfileError, load_profile


def _write(tmp_path: Path, name: str, body: str) -> Path:
    (tmp_path / f"{name}.yaml").write_text(textwrap.dedent(body))
    return tmp_path


def test_load_valid_stripe_profile(profiles_dir: Path):
    p = load_profile("stripe", profiles_dir)
    assert p.app == "stripe"
    assert p.display_name == "Stripe"
    assert [c.name for c in p.capabilities] == [
        "find_overdue_invoices",
        "email_overdue_customers",
    ]
    cap = p.capabilities[0]
    assert cap.params[0].name == "limit" and cap.params[0].python_type is int
    assert isinstance(cap.success_check, HtmlContains)
    assert cap.guardrails.forbidden_actions == ["navigate"]
    assert p.capabilities[1].guardrails.require_confirmation is True


def test_missing_profile_raises(profiles_dir: Path):
    with pytest.raises(ProfileError):
        load_profile("does_not_exist", profiles_dir)


VALID = """
app: demo
display_name: Demo
base_url: https://demo.test
login:
  success_check: {type: html_contains, value: Home}
capabilities:
  - name: do_thing
    description: d
    instruction_template: go
"""


def test_minimal_valid_profile(tmp_path: Path):
    d = _write(tmp_path, "demo", VALID)
    p = load_profile("demo", d)
    assert p.app == "demo" and p.defaults.max_steps == 25


def test_duplicate_capability_names_raise(tmp_path: Path):
    d = _write(
        tmp_path,
        "dup",
        """
        app: dup
        display_name: Dup
        base_url: https://x.test
        login: {success_check: {type: model_terminated}}
        capabilities:
          - {name: a, description: d, instruction_template: t}
          - {name: a, description: d, instruction_template: t}
        """,
    )
    with pytest.raises(ProfileError, match="duplicate"):
        load_profile("dup", d)


def test_reserved_status_name_rejected(tmp_path: Path):
    d = _write(
        tmp_path,
        "res",
        """
        app: res
        display_name: Res
        base_url: https://x.test
        login: {success_check: {type: model_terminated}}
        capabilities:
          - {name: status, description: d, instruction_template: t}
        """,
    )
    with pytest.raises(ProfileError, match="reserved"):
        load_profile("res", d)


def test_missing_base_url_raises(tmp_path: Path):
    d = _write(
        tmp_path,
        "nb",
        """
        app: nb
        display_name: NB
        login: {success_check: {type: model_terminated}}
        """,
    )
    with pytest.raises(ProfileError):
        load_profile("nb", d)


def test_unknown_success_check_type_raises(tmp_path: Path):
    d = _write(
        tmp_path,
        "bad",
        """
        app: bad
        display_name: Bad
        base_url: https://x.test
        login: {success_check: {type: telepathy}}
        """,
    )
    with pytest.raises(ProfileError):
        load_profile("bad", d)
