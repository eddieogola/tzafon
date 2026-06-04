"""Shared test doubles for lit-crm — no ``tzafon``, no network.

These fakes are the contract every slice tests against:

* :class:`FakeComputer`     — records every ``computer.*`` call; canned screenshot/html.
* :class:`FakeResponses`    — a scripted queue for ``client.responses.create``.
* :class:`FakeLightcone`    — wires the two together; records ``computer.create`` kwargs.
* :class:`FakeSessionManager` — in-memory session store; ``resume`` yields a FakeComputer.
* :class:`FakeEngine`       — returns a canned :class:`~lit_crm.engine.ActResult`.

Response-building helpers (:func:`computer_call`, :func:`message`, :func:`response`)
let engine tests script Northstar output as dicts *or* objects to exercise
``normalize_action`` against both shapes.
"""

from __future__ import annotations

from contextlib import contextmanager
from types import SimpleNamespace
from typing import Any, Iterator

from lit_crm.engine import ActResult


# --- Response scripting helpers ---------------------------------------------


def computer_call(action: dict[str, Any], call_id: str = "call_1", as_object: bool = False) -> Any:
    """Build a ``computer_call`` output item (dict by default, object if asked)."""
    payload = {"type": "computer_call", "call_id": call_id, "action": action}
    return SimpleNamespace(**payload) if as_object else payload


def message(text: str, as_object: bool = True) -> Any:
    """Build a ``message`` output item carrying text content."""
    block = SimpleNamespace(type="output_text", text=text)
    if as_object:
        return SimpleNamespace(type="message", content=[block])
    return {"type": "message", "content": [{"type": "output_text", "text": text}]}


def response(output: list[Any], response_id: str = "resp_1") -> SimpleNamespace:
    """Build a fake ``responses.create`` return value with ``.id`` and ``.output``."""
    return SimpleNamespace(id=response_id, output=list(output))


# --- Fakes ------------------------------------------------------------------


class FakeComputer:
    """Records calls; returns canned screenshot URLs and HTML.

    Set ``html_content`` / ``screenshot_url`` (or push a list of ``html_sequence``)
    to drive verification logic in tests.
    """

    def __init__(
        self,
        *,
        session_id: str = "env_fake",
        html_content: str = "<html></html>",
        screenshot_url: str = "https://shot/0.png",
        html_sequence: list[str] | None = None,
    ) -> None:
        self.id = session_id
        self.calls: list[tuple[str, tuple[Any, ...]]] = []
        self._html_content = html_content
        self._screenshot_url = screenshot_url
        self._html_sequence = list(html_sequence) if html_sequence else None
        self._shot_n = 0

    def _record(self, name: str, *args: Any) -> None:
        self.calls.append((name, args))

    # context-manager so it can be yielded directly by ``computer.create``
    def __enter__(self) -> "FakeComputer":
        return self

    def __exit__(self, *exc: Any) -> bool:
        self._record("__exit__")
        return False

    def navigate(self, url: str) -> None:
        self._record("navigate", url)

    def click(self, x: int, y: int) -> None:
        self._record("click", x, y)

    def double_click(self, x: int, y: int) -> None:
        self._record("double_click", x, y)

    def right_click(self, x: int, y: int) -> None:
        self._record("right_click", x, y)

    def type(self, text: str) -> None:  # noqa: A003 - mirrors SDK
        self._record("type", text)

    def hotkey(self, keys: str) -> None:
        self._record("hotkey", keys)

    def scroll(self, dx: int, dy: int, x: int, y: int) -> None:
        self._record("scroll", dx, dy, x, y)

    def wait(self, seconds: float) -> None:
        self._record("wait", seconds)

    def keep_alive(self) -> None:
        self._record("keep_alive")

    def screenshot(self) -> dict[str, Any]:
        self._record("screenshot")
        url = self._screenshot_url
        if "{n}" in url:
            url = url.format(n=self._shot_n)
        self._shot_n += 1
        return {"screenshot_url": url}

    def get_screenshot_url(self, result: Any) -> str:
        if isinstance(result, dict):
            return result.get("screenshot_url", self._screenshot_url)
        return self._screenshot_url

    def html(self) -> dict[str, Any]:
        self._record("html")
        if self._html_sequence:
            content = self._html_sequence.pop(0)
        else:
            content = self._html_content
        return {"html_content": content}

    def get_html_content(self, result: Any) -> str:
        if isinstance(result, dict):
            return result.get("html_content", "")
        return str(result)

    @property
    def navigated_urls(self) -> list[str]:
        return [a[0] for name, a in self.calls if name == "navigate"]

    def did(self, name: str) -> bool:
        return any(n == name for n, _ in self.calls)


class FakeResponses:
    """Scripted ``responses.create``: pops the next canned response per call."""

    def __init__(self, scripted: list[Any] | None = None) -> None:
        self._queue: list[Any] = list(scripted or [])
        self.calls: list[dict[str, Any]] = []

    def push(self, resp: Any) -> "FakeResponses":
        self._queue.append(resp)
        return self

    def create(self, **kwargs: Any) -> Any:
        self.calls.append(kwargs)
        if not self._queue:
            # default: a bare terminal message so loops don't hang
            return response([message("done")], response_id=f"resp_{len(self.calls)}")
        return self._queue.pop(0)

    @property
    def last(self) -> dict[str, Any]:
        return self.calls[-1]


class _ComputerFactory:
    def __init__(self, computer: FakeComputer, raises: BaseException | None = None) -> None:
        self._computer = computer
        self._raises = raises
        self.create_calls: list[dict[str, Any]] = []

    @contextmanager
    def create(self, **kwargs: Any) -> Iterator[FakeComputer]:
        self.create_calls.append(kwargs)
        if self._raises is not None:
            raise self._raises
        yield self._computer


class FakeLightcone:
    """A fake Lightcone client satisfying the ``LightconeClient`` Protocol."""

    def __init__(
        self,
        *,
        responses: FakeResponses | None = None,
        computer: FakeComputer | None = None,
        create_raises: BaseException | None = None,
    ) -> None:
        self.responses = responses or FakeResponses()
        self.fake_computer = computer or FakeComputer()
        self.computer = _ComputerFactory(self.fake_computer, raises=create_raises)

    @property
    def create_calls(self) -> list[dict[str, Any]]:
        return self.computer.create_calls


class FakeSessionManager:
    """In-memory SessionManager double for server/login tests."""

    def __init__(self, *, sessions: dict[str, str] | None = None, computer: FakeComputer | None = None) -> None:
        self._sessions = dict(sessions or {})
        self._computer = computer or FakeComputer()
        self.saved: list[tuple[str, str]] = []

    def save(self, app: str, environment_id: str, *, base_url: str | None = None) -> None:
        self._sessions[app] = environment_id
        self.saved.append((app, environment_id))

    def load(self, app: str) -> str | None:
        return self._sessions.get(app)

    @contextmanager
    def resume(self, app: str) -> Iterator[FakeComputer]:
        from lit_crm.session import NoSessionError

        if app not in self._sessions:
            raise NoSessionError(app)
        yield self._computer

    @contextmanager
    def create_persistent(self) -> Iterator[FakeComputer]:
        yield self._computer


class FakeEngine:
    """Returns a preset :class:`ActResult`; records every ``run`` call."""

    def __init__(self, result: ActResult | None = None) -> None:
        self.result = result or ActResult(status="success", steps_taken=1, summary="ok")
        self.runs: list[dict[str, Any]] = []

    def run(self, computer: Any, instruction: str, **kwargs: Any) -> ActResult:
        self.runs.append({"instruction": instruction, **kwargs})
        return self.result
