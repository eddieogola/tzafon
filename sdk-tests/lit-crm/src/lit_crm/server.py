"""FastMCP server: dynamically registers one tool per profile capability.

CONTRACT STUB — ``build_server`` and ``main`` are the frozen entrypoints. The
server slice implements dynamic tool registration, the confirmation guard, and the
built-in ``status`` tool. ``engine`` and ``session_mgr`` are injected so the
registration logic is testable with fakes (no real engine/session needed).
"""

from __future__ import annotations

import inspect
from typing import TYPE_CHECKING, Any

from .engine import ActEngine
from .profile import Capability, Profile
from .session import NoSessionError, SessionManager

if TYPE_CHECKING:
    from mcp.server.fastmcp import FastMCP


def _find_capability(profile: Profile, capability_name: str) -> Capability:
    for cap in profile.capabilities:
        if cap.name == capability_name:
            return cap
    raise KeyError(f"no capability {capability_name!r} in profile {profile.app!r}")


def run_capability(
    profile: Profile,
    capability_name: str,
    session_mgr: SessionManager,
    engine: ActEngine,
    **kwargs: Any,
) -> dict[str, Any]:
    """Invoke a capability: confirmation guard, resume session, run engine."""
    cap = _find_capability(profile, capability_name)

    # Confirmation guard — never touch the engine without confirm.
    if cap.guardrails.require_confirmation and not kwargs.get("confirm"):
        return {
            "status": "needs_confirmation",
            "message": f"{cap.name} mutates state; call again with confirm=true",
        }

    # Pre-fill defaults so .format tolerates omitted optional params.
    render_kwargs: dict[str, Any] = {}
    for param in cap.params:
        if param.default is not None:
            render_kwargs[param.name] = param.default
    render_kwargs.update(kwargs)

    url = cap.start_url or profile.base_url
    instruction = cap.instruction_template.format(**render_kwargs)

    try:
        with session_mgr.resume(profile.app) as computer:
            computer.navigate(url)
            computer.wait(2)
            result = engine.run(
                computer,
                instruction,
                success_check=cap.success_check,
                guardrails=cap.guardrails,
                extract=cap.extract,
                display=(profile.display_width, profile.display_height),
            )
            return result.to_mcp_dict()
    except NoSessionError:
        return {
            "status": "error",
            "error": f"not logged in; run: APP={profile.app} uv run lit-crm-login",
        }


def _make_capability_fn(
    profile: Profile,
    cap: Capability,
    session_mgr: SessionManager,
    engine: ActEngine,
):
    """Synthesize a function whose signature mirrors ``cap.params`` for FastMCP."""

    def fn(**kwargs: Any) -> dict[str, Any]:
        return run_capability(profile, cap.name, session_mgr, engine, **kwargs)

    params: list[inspect.Parameter] = []
    annotations: dict[str, Any] = {}
    for param in cap.params:
        if param.required:
            default = inspect.Parameter.empty
        else:
            default = param.default
        params.append(
            inspect.Parameter(
                param.name,
                kind=inspect.Parameter.KEYWORD_ONLY,
                default=default,
                annotation=param.python_type,
            )
        )
        annotations[param.name] = param.python_type
    annotations["return"] = dict

    fn.__name__ = cap.name
    fn.__qualname__ = cap.name
    fn.__doc__ = cap.description
    fn.__signature__ = inspect.Signature(params, return_annotation=dict)
    fn.__annotations__ = annotations
    return fn


def registered_tool_names(server: "FastMCP") -> set[str]:
    """Return the set of tool names registered on ``server`` (FastMCP-version safe)."""
    return {tool.name for tool in server._tool_manager.list_tools()}


def build_server(
    profile: Profile,
    session_mgr: SessionManager,
    engine: ActEngine,
) -> "FastMCP":
    """Build a FastMCP instance with a tool per capability plus ``status``."""
    from mcp.server.fastmcp import FastMCP

    mcp = FastMCP(f"lit-crm-{profile.app}")

    for cap in profile.capabilities:
        fn = _make_capability_fn(profile, cap, session_mgr, engine)
        mcp.tool(name=cap.name, description=cap.description)(fn)

    def status() -> dict[str, Any]:
        return {
            "app": profile.app,
            "logged_in": session_mgr.load(profile.app) is not None,
            "capabilities": [c.name for c in profile.capabilities],
        }

    mcp.tool(name="status", description=f"Status of the {profile.display_name} connector.")(status)

    return mcp


def main() -> None:
    """Console-script entrypoint: ``APP=<app> lit-crm`` (stdio transport)."""
    from . import lightcone_client
    from .config import load_config
    from .profile import load_profile

    cfg = load_config()
    profile = load_profile(cfg.app, cfg.profiles_dir)
    client = lightcone_client.build_client()
    session_mgr = SessionManager(client, cfg.session_dir)
    engine = ActEngine(
        client,
        max_steps=profile.defaults.max_steps,
        step_wait_seconds=profile.defaults.step_wait_seconds,
    )
    server = build_server(profile, session_mgr, engine)
    server.run()
