"""The dependency-injection seam for the Lightcone SDK.

Everything in lit-crm talks to Lightcone through the :class:`LightconeClient`
Protocol, so tests inject a fake without importing ``tzafon`` or touching the network.
``build_client`` is the only place the real SDK is constructed.
"""

from __future__ import annotations

from typing import Any, ContextManager, Protocol, runtime_checkable


@runtime_checkable
class ComputerSession(Protocol):
    """A live browser/computer session (the object yielded by ``computer.create``)."""

    id: str | None

    def navigate(self, url: str) -> Any: ...
    def click(self, x: int, y: int) -> Any: ...
    def double_click(self, x: int, y: int) -> Any: ...
    def right_click(self, x: int, y: int) -> Any: ...
    def type(self, text: str) -> Any: ...  # noqa: A003 - mirrors SDK name
    def hotkey(self, keys: str) -> Any: ...
    def scroll(self, dx: int, dy: int, x: int, y: int) -> Any: ...
    def wait(self, seconds: float) -> Any: ...
    def keep_alive(self) -> Any: ...
    def screenshot(self) -> Any: ...
    def get_screenshot_url(self, result: Any) -> str: ...
    def html(self) -> Any: ...
    def get_html_content(self, result: Any) -> str: ...


class _ComputerFactory(Protocol):
    def create(self, **kwargs: Any) -> ContextManager[ComputerSession]: ...


class _Responses(Protocol):
    def create(self, **kwargs: Any) -> Any: ...


@runtime_checkable
class LightconeClient(Protocol):
    """The subset of the Lightcone SDK surface lit-crm depends on."""

    responses: _Responses
    computer: _ComputerFactory


def build_client() -> LightconeClient:
    """Construct the real Lightcone client from ``TZAFON_API_KEY``."""
    import os

    from tzafon import Lightcone

    return Lightcone(
        api_key=os.getenv("TZAFON_API_KEY"),
        timeout=30.0,
        max_retries=3,
    )
