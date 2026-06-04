"""Declarative per-app profiles — the "templates".

A profile is a YAML file under ``profiles/``. Shipping a new SaaS app = authoring
one of these, no Python. The Pydantic models here both validate the YAML and provide
the metadata the server uses to synthesize one MCP tool per capability.
"""

from __future__ import annotations

from pathlib import Path
from typing import Annotated, Any, Literal, Union

import yaml
from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator

#: Maps profile param types to Python types (used to build MCP tool signatures).
PARAM_TYPES: dict[str, type] = {
    "string": str,
    "integer": int,
    "number": float,
    "boolean": bool,
}


class ProfileError(ValueError):
    """Raised when a profile file is missing, malformed, or invalid."""


# --- Success checks (tagged union on ``type``) ------------------------------


class HtmlContains(BaseModel):
    type: Literal["html_contains"]
    value: str


class HtmlAbsent(BaseModel):
    type: Literal["html_absent"]
    value: str


class ModelTerminated(BaseModel):
    type: Literal["model_terminated"]


class AnswerMatches(BaseModel):
    type: Literal["answer_matches"]
    pattern: str


class UrlContains(BaseModel):
    type: Literal["url_contains"]
    value: str


SuccessCheck = Annotated[
    Union[HtmlContains, HtmlAbsent, ModelTerminated, AnswerMatches, UrlContains],
    Field(discriminator="type"),
]


# --- Capability building blocks ---------------------------------------------


class Param(BaseModel):
    name: str
    type: Literal["string", "integer", "number", "boolean"]
    description: str = ""
    required: bool = True
    default: Any | None = None

    @property
    def python_type(self) -> type:
        return PARAM_TYPES[self.type]


class Guardrails(BaseModel):
    max_steps: int | None = None
    allowed_domains: list[str] = Field(default_factory=list)
    forbidden_actions: list[str] = Field(default_factory=list)
    require_confirmation: bool = False


class ExtractSpec(BaseModel):
    prompt: str
    format: Literal["text", "json"] = "text"


class Capability(BaseModel):
    name: str
    description: str
    params: list[Param] = Field(default_factory=list)
    start_url: str | None = None
    instruction_template: str
    guardrails: Guardrails = Field(default_factory=Guardrails)
    success_check: SuccessCheck = Field(default=ModelTerminated(type="model_terminated"))
    extract: ExtractSpec | None = None


class LoginSpec(BaseModel):
    start_url: str | None = None
    success_check: SuccessCheck
    instructions: str | None = None


class Defaults(BaseModel):
    max_steps: int = 25
    step_wait_seconds: float = 1.0


class Profile(BaseModel):
    app: str
    display_name: str
    base_url: str
    display_width: int = 1280
    display_height: int = 720
    login: LoginSpec
    defaults: Defaults = Field(default_factory=Defaults)
    capabilities: list[Capability] = Field(default_factory=list)

    @field_validator("app")
    @classmethod
    def _app_lower(cls, v: str) -> str:
        return v.strip().lower()

    @model_validator(mode="after")
    def _unique_capability_names(self) -> "Profile":
        names = [c.name for c in self.capabilities]
        dupes = {n for n in names if names.count(n) > 1}
        if dupes:
            raise ValueError(f"duplicate capability names: {sorted(dupes)}")
        if "status" in names:
            raise ValueError("'status' is reserved (built-in tool)")
        return self


def load_profile(app: str, profiles_dir: Path) -> Profile:
    """Load and validate ``profiles_dir/<app>.yaml`` into a :class:`Profile`."""
    path = Path(profiles_dir) / f"{app}.yaml"
    if not path.exists():
        raise ProfileError(f"No profile for app {app!r} at {path}")
    try:
        raw = yaml.safe_load(path.read_text())
    except yaml.YAMLError as e:  # pragma: no cover - passthrough
        raise ProfileError(f"Invalid YAML in {path}: {e}") from e
    if not isinstance(raw, dict):
        raise ProfileError(f"Profile {path} must be a mapping at the top level")
    try:
        return Profile.model_validate(raw)
    except ValidationError as e:
        raise ProfileError(f"Invalid profile {path}:\n{e}") from e
