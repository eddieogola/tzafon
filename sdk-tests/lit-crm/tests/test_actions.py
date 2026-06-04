"""Tests for action normalization + execution (foundation module)."""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from lit_crm.actions import (
    Action,
    ActionExecutor,
    UnknownActionError,
    normalize_action,
)

from .fakes import FakeComputer


def test_normalize_click_from_dict():
    a = normalize_action({"type": "click", "x": 100, "y": 200})
    assert a == Action(type="click", x=100, y=200)


def test_normalize_click_from_object():
    raw = SimpleNamespace(type="click", x=100, y=200)
    a = normalize_action(raw)
    assert a.type == "click" and a.x == 100 and a.y == 200


def test_normalize_unwraps_computer_call_wrapper():
    raw = {"type": "computer_call", "call_id": "c1", "action": {"type": "type", "text": "hi"}}
    a = normalize_action(raw)
    assert a.type == "type" and a.text == "hi"


def test_normalize_keys_string_coerced_to_list():
    a = normalize_action({"type": "key", "keys": "enter"})
    assert a.keys == ["enter"]


def test_normalize_scroll_fields():
    a = normalize_action({"type": "scroll", "scroll_x": 0, "scroll_y": 300, "x": 5, "y": 6})
    assert (a.scroll_x, a.scroll_y, a.x, a.y) == (0, 300, 5, 6)


def test_terminal_flag():
    assert normalize_action({"type": "done"}).is_terminal
    assert not normalize_action({"type": "click"}).is_terminal


@pytest.mark.parametrize(
    "action,expected",
    [
        (Action(type="click", x=1, y=2), ("click", (1, 2))),
        (Action(type="double_click", x=3, y=4), ("double_click", (3, 4))),
        (Action(type="right_click", x=5, y=6), ("right_click", (5, 6))),
    ],
)
def test_executor_click_family(action, expected):
    comp = FakeComputer()
    ActionExecutor().execute(comp, action)
    assert comp.calls == [expected]


def test_executor_type():
    comp = FakeComputer()
    ActionExecutor().execute(comp, Action(type="type", text="hello"))
    assert comp.calls == [("type", ("hello",))]


def test_executor_key_joins_combo():
    comp = FakeComputer()
    ActionExecutor().execute(comp, Action(type="key", keys=["ctrl", "c"]))
    assert comp.calls == [("hotkey", ("ctrl+c",))]


def test_executor_scroll():
    comp = FakeComputer()
    ActionExecutor().execute(comp, Action(type="scroll", scroll_x=0, scroll_y=300, x=10, y=20))
    assert comp.calls == [("scroll", (0, 300, 10, 20))]


def test_executor_navigate():
    comp = FakeComputer()
    ActionExecutor().execute(comp, Action(type="navigate", url="https://x.com"))
    assert comp.calls == [("navigate", ("https://x.com",))]


def test_executor_terminal_is_noop():
    comp = FakeComputer()
    ActionExecutor().execute(comp, Action(type="done"))
    assert comp.calls == []


def test_executor_unknown_raises():
    with pytest.raises(UnknownActionError):
        ActionExecutor().execute(FakeComputer(), Action(type="frobnicate"))
