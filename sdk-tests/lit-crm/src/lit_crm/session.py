"""SessionManager: create, save, and resume persistent authenticated sessions.

CONTRACT STUB — exceptions and the ``SessionManager`` signature are the frozen
interface ``server.py``/``login.py`` and the fakes depend on. The session slice
fills in the bodies.

The store holds only the opaque Lightcone ``environment_id`` per app (never
credentials), as JSON at ``<session_dir>/<app>.json``.
"""

from __future__ import annotations

import json
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from .lightcone_client import ComputerSession, LightconeClient


class NoSessionError(RuntimeError):
    """Raised when a capability runs before ``lit-crm-login`` saved a session."""


class SessionManager:
    def __init__(self, client: LightconeClient, store_dir: Path) -> None:
        self.client = client
        self.store_dir = Path(store_dir)

    def _path(self, app: str) -> Path:
        return self.store_dir / f"{app}.json"

    def save(self, app: str, environment_id: str, *, base_url: str | None = None) -> None:
        """Persist the environment id for ``app``."""
        self.store_dir.mkdir(parents=True, exist_ok=True)
        payload = {"environment_id": environment_id, "base_url": base_url}
        self._path(app).write_text(json.dumps(payload), encoding="utf-8")

    def load(self, app: str) -> str | None:
        """Return the saved environment id for ``app``, or ``None``."""
        path = self._path(app)
        if not path.exists():
            return None
        data = json.loads(path.read_text(encoding="utf-8"))
        return data.get("environment_id")

    @contextmanager
    def create_persistent(self) -> Iterator[ComputerSession]:
        """Open a fresh persistent browser session (used by the login flow)."""
        with self.client.computer.create(kind="browser", persistent=True) as session:
            yield session

    @contextmanager
    def resume(self, app: str) -> Iterator[ComputerSession]:
        """Resume ``app``'s saved authenticated session. Raises NoSessionError."""
        environment_id = self.load(app)
        if environment_id is None:
            raise NoSessionError(app)
        with self.client.computer.create(kind="browser", environment_id=environment_id) as session:
            yield session
