"""Northstar action normalization + execution.

The reference loop (``cua_protocol.py::execute_action``) reads some fields by dict
key and others by attribute, which breaks depending on how the SDK serializes the
response. ``normalize_action`` collapses both shapes into a single typed
:class:`Action` once, so the rest of the codebase never touches raw output again.

Coordinates from the Responses API are already pixel-scaled for the declared
display size, so they map 1:1 to ``computer.click(x, y)`` — no 0-999 rescaling.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

#: Action types that signal the model considers the task finished.
TERMINAL_ACTIONS = frozenset({"terminate", "done", "answer"})


class UnknownActionError(ValueError):
    """Raised when an action type has no mapping to a computer command."""


@dataclass
class Action:
    """A single normalized Northstar action."""

    type: str
    x: int | None = None
    y: int | None = None
    text: str | None = None
    keys: list[str] = field(default_factory=list)
    scroll_x: int | None = None
    scroll_y: int | None = None
    url: str | None = None
    button: str | None = None

    @property
    def is_terminal(self) -> bool:
        return self.type in TERMINAL_ACTIONS

    def as_log(self, step: int) -> dict[str, Any]:
        """A compact, JSON-friendly record for the actions log."""
        out: dict[str, Any] = {"step": step, "type": self.type}
        for k in ("x", "y", "text", "keys", "scroll_x", "scroll_y", "url", "button"):
            v = getattr(self, k)
            if v not in (None, [], ""):
                out[k] = v
        return out


def _get(obj: Any, key: str, default: Any = None) -> Any:
    """Read ``key`` from a dict or an object, transparently."""
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def normalize_action(raw: Any) -> Action:
    """Normalize a raw action (dict or object) into an :class:`Action`.

    Accepts either the action payload itself (``{"type": "click", ...}``) or a
    ``computer_call`` wrapper that nests it under an ``"action"`` key.
    """
    nested = _get(raw, "action", None)
    action = nested if nested is not None else raw

    keys = _get(action, "keys") or []
    if isinstance(keys, str):
        keys = [keys]

    return Action(
        type=_get(action, "type"),
        x=_get(action, "x"),
        y=_get(action, "y"),
        text=_get(action, "text"),
        keys=list(keys),
        scroll_x=_get(action, "scroll_x"),
        scroll_y=_get(action, "scroll_y"),
        url=_get(action, "url"),
        button=_get(action, "button"),
    )


class ActionExecutor:
    """Maps a normalized :class:`Action` onto ``computer.*`` calls."""

    def execute(self, computer: Any, action: Action) -> None:
        t = action.type
        if t == "click":
            computer.click(action.x, action.y)
        elif t == "double_click":
            computer.double_click(action.x, action.y)
        elif t == "right_click":
            computer.right_click(action.x, action.y)
        elif t == "type":
            computer.type(action.text or "")
        elif t in ("key", "keypress", "hotkey"):
            combo = "+".join(action.keys) if action.keys else (action.text or "")
            computer.hotkey(combo)
        elif t == "scroll":
            computer.scroll(
                action.scroll_x or 0,
                action.scroll_y or 0,
                action.x or 0,
                action.y or 0,
            )
        elif t in ("navigate", "go_to_url"):
            computer.navigate(action.url)
        elif t == "wait":
            computer.wait(1)
        elif t in TERMINAL_ACTIONS:
            # Terminal actions are handled by the engine loop, not executed.
            return
        else:
            raise UnknownActionError(f"No computer mapping for action type {t!r}")
