"""ActEngine: the controlled Responses-API CUA loop.

CONTRACT STUB — ``ActResult``, exceptions, and the ``ActEngine`` signature are the
frozen interface other modules and fakes depend on. The engine slice fills in
``ActEngine.run`` (and private helpers); do not change the public shapes below
without updating ``tests/fakes.py``, ``server.py``, and the plan.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Any, Literal
from urllib.parse import urlparse

from .actions import ActionExecutor, normalize_action
from .lightcone_client import ComputerSession, LightconeClient
from .profile import ExtractSpec, Guardrails, SuccessCheck

MODEL = "tzafon.northstar-cua-fast"

Status = Literal["success", "failed", "max_steps", "blocked", "error"]


@dataclass
class ActResult:
    """The structured outcome of one capability run, returned to the MCP caller."""

    status: Status
    steps_taken: int = 0
    summary: str = ""
    extracted: Any | None = None
    final_screenshot_url: str = ""
    actions_log: list[dict[str, Any]] = field(default_factory=list)
    error: str | None = None

    def to_mcp_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "steps_taken": self.steps_taken,
            "summary": self.summary,
            "extracted": self.extracted,
            "final_screenshot_url": self.final_screenshot_url,
            "actions_log": self.actions_log,
            "error": self.error,
        }


class ActEngine:
    """Drives Northstar through a bounded, guard-railed Responses loop.

    The Lightcone ``client`` is injected so the loop is fully testable against a
    fake. Implemented by the engine slice.
    """

    def __init__(
        self,
        client: LightconeClient,
        executor: ActionExecutor | None = None,
        *,
        max_steps: int = 25,
        step_wait_seconds: float = 1.0,
    ) -> None:
        self.client = client
        self.executor = executor or ActionExecutor()
        self.max_steps = max_steps
        self.step_wait_seconds = step_wait_seconds

    def run(
        self,
        computer: ComputerSession,
        instruction: str,
        *,
        success_check: SuccessCheck,
        guardrails: Guardrails,
        extract: ExtractSpec | None = None,
        display: tuple[int, int] = (1280, 720),
    ) -> ActResult:
        """Run ``instruction`` to completion and return a structured result."""
        width, height = display
        tool = {
            "type": "computer_use",
            "display_width": width,
            "display_height": height,
            "environment": "browser",
        }
        max_steps = guardrails.max_steps or self.max_steps

        actions_log: list[dict[str, Any]] = []
        steps_taken = 0
        final_message_text = ""
        final_screenshot_url = ""
        terminated = False  # loop ended via terminal action or no-call
        exhausted = False

        try:
            # --- Initial turn -------------------------------------------------
            shot = computer.screenshot()
            shot_url = computer.get_screenshot_url(shot)
            final_screenshot_url = shot_url

            response = self.client.responses.create(
                model=MODEL,
                input=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": instruction},
                            {"type": "input_image", "image_url": shot_url, "detail": "auto"},
                        ],
                    }
                ],
                tools=[tool],
            )

            # --- Bounded loop -------------------------------------------------
            for step in range(max_steps):
                call, msg_text = self._scan_output(response)
                if msg_text:
                    final_message_text = msg_text

                if call is None:
                    # Model is done talking.
                    terminated = True
                    break

                action = normalize_action(call)

                # Guardrails BEFORE executing.
                if action.type in guardrails.forbidden_actions:
                    return ActResult(
                        status="blocked",
                        steps_taken=steps_taken,
                        summary=final_message_text,
                        final_screenshot_url=final_screenshot_url,
                        actions_log=actions_log,
                        error=f"forbidden action: {action.type}",
                    )

                if action.type in ("navigate", "go_to_url") and guardrails.allowed_domains:
                    host = urlparse(action.url or "").hostname or ""
                    if host not in guardrails.allowed_domains:
                        return ActResult(
                            status="blocked",
                            steps_taken=steps_taken,
                            summary=final_message_text,
                            final_screenshot_url=final_screenshot_url,
                            actions_log=actions_log,
                            error=f"off-domain navigate blocked: {host}",
                        )

                if action.is_terminal:
                    terminated = True
                    break

                # Execute the action.
                self.executor.execute(computer, action)
                actions_log.append(action.as_log(step))
                steps_taken += 1
                computer.wait(self.step_wait_seconds)

                # Continue: new screenshot + computer_call_output.
                shot = computer.screenshot()
                shot_url = computer.get_screenshot_url(shot)
                final_screenshot_url = shot_url
                call_id = self._get(call, "call_id")

                response = self.client.responses.create(
                    model=MODEL,
                    previous_response_id=response.id,
                    input=[
                        {
                            "type": "computer_call_output",
                            "call_id": call_id,
                            "output": {
                                "type": "input_image",
                                "image_url": shot_url,
                                "detail": "auto",
                            },
                        }
                    ],
                    tools=[tool],
                )
            else:
                # Loop ran the full range without break -> max_steps exhausted.
                exhausted = True
                _, msg_text = self._scan_output(response)
                if msg_text:
                    final_message_text = msg_text

            # --- Verify -------------------------------------------------------
            verified = self._verify(
                success_check,
                computer,
                terminated=terminated,
                final_message_text=final_message_text,
            )
            if verified:
                status: Status = "success"
            elif exhausted:
                status = "max_steps"
            else:
                status = "failed"

            # --- Extract (tools-off) -----------------------------------------
            extracted: Any | None = None
            if extract is not None:
                extract_resp = self.client.responses.create(
                    model=MODEL,
                    previous_response_id=response.id,
                    input=[
                        {
                            "role": "user",
                            "content": [{"type": "input_text", "text": extract.prompt}],
                        }
                    ],
                )
                _, text = self._scan_output(extract_resp)
                if extract.format == "json":
                    try:
                        extracted = json.loads(text)
                    except (ValueError, TypeError):
                        extracted = text
                else:
                    extracted = text

            return ActResult(
                status=status,
                steps_taken=steps_taken,
                summary=final_message_text,
                extracted=extracted,
                final_screenshot_url=final_screenshot_url,
                actions_log=actions_log,
            )
        except Exception as e:  # noqa: BLE001 - surface any failure as an error result
            return ActResult(status="error", error=str(e), steps_taken=steps_taken)

    # --- Private helpers -----------------------------------------------------

    @staticmethod
    def _get(obj: Any, key: str, default: Any = None) -> Any:
        """Read ``key`` from a dict or object transparently."""
        if obj is None:
            return default
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    def _scan_output(self, response: Any) -> tuple[Any | None, str]:
        """Return the first ``computer_call`` item and any message text."""
        call = None
        text_parts: list[str] = []
        for item in self._get(response, "output", None) or []:
            itype = self._get(item, "type")
            if itype == "computer_call" and call is None:
                call = item
            elif itype == "message":
                for block in self._get(item, "content", None) or []:
                    btext = self._get(block, "text")
                    if btext:
                        text_parts.append(btext)
        return call, "".join(text_parts)

    def _verify(
        self,
        success_check: SuccessCheck,
        computer: ComputerSession,
        *,
        terminated: bool,
        final_message_text: str,
    ) -> bool:
        """Evaluate a :class:`SuccessCheck` against the final session state."""
        check_type = self._get(success_check, "type")

        if check_type == "model_terminated":
            return terminated

        if check_type == "answer_matches":
            pattern = self._get(success_check, "pattern", "")
            return bool(re.search(pattern, final_message_text or ""))

        if check_type in ("html_contains", "html_absent", "url_contains"):
            html = computer.get_html_content(computer.html())
            value = self._get(success_check, "value", "")
            if check_type == "html_absent":
                return value not in html
            # url_contains is best-effort: treat as html_contains for now.
            return value in html

        return False
