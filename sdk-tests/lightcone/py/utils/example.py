"""Docs-conformance harness.

Each example function is tagged with the docs page and anchor it demonstrates.
The Reference URL is derived from that tag rather than hand-written, so it
cannot silently drift from the docs. Failures are recorded rather than
swallowed; `summary()` reports them and yields the process exit code.
"""

from __future__ import annotations

import asyncio
import inspect
import signal
from contextlib import contextmanager
from dataclasses import dataclass
from functools import wraps
from time import time
from typing import Any, Callable

from utils.term import Colors

DOCS_BASE = "https://docs.lightcone.ai"

# A task event stream can wedge mid-task: it stops emitting without sending
# `completed`/`failed`, and the client's request timeout does not cover the
# gap between stream events. Without this, one hung example blocks the whole
# run indefinitely (observed: 58 minutes on a single start_stream call).
# Sized above the slowest legitimate agentic example seen (~7 min).
DEFAULT_TIMEOUT_SECONDS = 600


class ExampleTimeout(Exception):
    """Raised when an example exceeds its wall-clock budget."""


class ExampleFailed(AssertionError):
    """Raised by check() when an example's own verification fails."""


def check(condition: object, message: str) -> None:
    """Fail the example unless `condition` holds.

    The harness only records a failure when an example *raises* — printing a
    problem and returning still counts as a pass. Examples that verify
    something (a login succeeded, an element was found) must use this, or they
    go green while proving nothing.
    """
    if not condition:
        raise ExampleFailed(message)


@contextmanager
def _deadline(seconds: int, label: str):
    """Wall-clock guard. SIGALRM is Unix + main-thread only; no-op elsewhere."""
    if not seconds or not hasattr(signal, "SIGALRM"):
        yield
        return

    def _fire(signum, frame):
        raise ExampleTimeout(f"exceeded {seconds}s wall-clock budget ({label})")

    try:
        previous = signal.signal(signal.SIGALRM, _fire)
    except ValueError:
        # Not the main thread — cannot arm the alarm.
        yield
        return

    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, previous)


@dataclass
class Result:
    title: str
    url: str
    ok: bool
    duration: float
    error: Exception | None = None


_results: list[Result] = []


def docs_url(page: str, anchor: str | None = None) -> str:
    """Build a docs URL from a page path and optional anchor."""
    url = f"{DOCS_BASE}/{page.strip('/')}/"
    return f"{url}#{anchor}" if anchor else url


def _banner(title: str, url: str) -> None:
    print(f"{Colors.YELLOW}*** {title} ***{Colors.RESET}\n")
    print(f"Reference: {Colors.BLUE}{url}{Colors.RESET}\n")


def _record(title: str, url: str, start_time: float, error: Exception | None) -> None:
    duration = time() - start_time
    _results.append(Result(title, url, error is None, duration, error))
    print(f"\n{Colors.GREEN}Execution time: {duration:.2f} seconds{Colors.RESET}\n")


def example(
    page: str,
    anchor: str | None = None,
    *,
    title: str,
    timeout: int | None = DEFAULT_TIMEOUT_SECONDS,
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """Tag a function as the runnable example for one docs anchor.

    `page` is the docs path (e.g. "guides/quickstart"); `anchor` is the
    heading id on that page. Both are data: the Reference URL is computed
    from them, and they are what a coverage check would diff against the
    live docs.

    Works on both `def` and `async def`. Decorating a coroutine function
    with a sync-only wrapper would return the coroutine un-awaited — the
    body would never enter the try block, so failures would go unrecorded.
    """

    def decorator(fn: Callable[..., Any]) -> Callable[..., Any]:
        url = docs_url(page, anchor)
        meta = {"page": page, "anchor": anchor, "title": title, "url": url}

        if inspect.iscoroutinefunction(fn):

            @wraps(fn)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                _banner(title, url)
                start_time = time()
                error: Exception | None = None
                try:
                    if timeout:
                        return await asyncio.wait_for(fn(*args, **kwargs), timeout)
                    return await fn(*args, **kwargs)
                except asyncio.TimeoutError:
                    error = ExampleTimeout(f"exceeded {timeout}s wall-clock budget")
                    print(f"\n{Colors.RED}Timeout in {fn.__name__}: {error}{Colors.RESET}\n")
                    return None
                except Exception as e:
                    error = e
                    print(f"\n{Colors.RED}Error in {fn.__name__}: {e}{Colors.RESET}\n")
                    return None
                finally:
                    _record(title, url, start_time, error)

            async_wrapper.example = meta  # type: ignore[attr-defined]
            return async_wrapper

        @wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            _banner(title, url)
            start_time = time()
            error: Exception | None = None
            try:
                with _deadline(timeout, fn.__name__):
                    return fn(*args, **kwargs)
            except Exception as e:
                error = e
                print(f"\n{Colors.RED}Error in {fn.__name__}: {e}{Colors.RESET}\n")
                return None
            finally:
                _record(title, url, start_time, error)

        wrapper.example = meta  # type: ignore[attr-defined]
        return wrapper

    return decorator


def results() -> list[Result]:
    """Every example that has run so far, in order."""
    return list(_results)


def summary() -> int:
    """Print a run summary. Returns the exit code: 1 if anything failed."""
    if not _results:
        print(f"{Colors.YELLOW}No examples ran.{Colors.RESET}\n")
        return 0

    failed = [r for r in _results if not r.ok]
    total = len(_results)
    elapsed = sum(r.duration for r in _results)

    print(f"{Colors.YELLOW}{'=' * 62}{Colors.RESET}")
    print(f"{Colors.YELLOW}  Summary{Colors.RESET}")
    print(f"{Colors.YELLOW}{'=' * 62}{Colors.RESET}\n")

    for r in failed:
        print(f"{Colors.RED}  FAIL{Colors.RESET}  {r.title}")
        print(f"        {r.url}")
        print(f"        {type(r.error).__name__}: {r.error}\n")

    passed = total - len(failed)
    color = Colors.RED if failed else Colors.GREEN
    print(f"{color}{passed}/{total} passed{Colors.RESET} in {elapsed:.2f}s\n")

    return 1 if failed else 0
