"""Runtime configuration: env loading, APP resolution, and on-disk paths.

Deliberately imports no SDK so it stays trivially testable.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


class ConfigError(RuntimeError):
    """Raised when required configuration (e.g. APP) is missing."""


@dataclass(frozen=True)
class Config:
    app: str
    profiles_dir: Path
    session_dir: Path


def load_env() -> None:
    """Load the workspace ``.env`` (TZAFON_API_KEY) if present."""
    load_dotenv()


def resolve_app(explicit: str | None = None) -> str:
    """Resolve the active app from an explicit value or the ``APP`` env var."""
    app = explicit or os.getenv("APP")
    if not app:
        raise ConfigError(
            "No app selected. Set APP=<profile> (e.g. APP=stripe) or pass --app."
        )
    return app.strip().lower()


def default_profiles_dir() -> Path:
    """Profiles live next to the project root by default; override with PROFILES_DIR."""
    env = os.getenv("PROFILES_DIR")
    if env:
        return Path(env).expanduser()
    # src/lit_crm/config.py -> project root is two parents up from this file's package.
    return Path(__file__).resolve().parents[2] / "profiles"


def default_session_dir() -> Path:
    """Persistent-session id store; override with LIT_CRM_HOME."""
    home = os.getenv("LIT_CRM_HOME")
    base = Path(home).expanduser() if home else Path.home() / ".lit-crm"
    return base / "sessions"


def load_config(
    explicit_app: str | None = None,
    *,
    profiles_dir: Path | None = None,
    session_dir: Path | None = None,
) -> Config:
    """Build a :class:`Config`, loading ``.env`` as a side effect."""
    load_env()
    return Config(
        app=resolve_app(explicit_app),
        profiles_dir=profiles_dir or default_profiles_dir(),
        session_dir=session_dir or default_session_dir(),
    )
