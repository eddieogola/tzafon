"""Tests for the controlled Responses-API CUA loop (ActEngine.run)."""

from __future__ import annotations

import pytest

from lit_crm.engine import ActEngine, ActResult
from lit_crm.profile import (
    AnswerMatches,
    ExtractSpec,
    Guardrails,
    HtmlContains,
    ModelTerminated,
)

from tests.fakes import (
    FakeComputer,
    FakeLightcone,
    FakeResponses,
    computer_call,
    message,
    response,
)


def _run(client, computer, **kwargs):
    engine = ActEngine(client)
    defaults = dict(
        success_check=ModelTerminated(type="model_terminated"),
        guardrails=Guardrails(),
    )
    defaults.update(kwargs)
    return engine.run(computer, "do a thing", **defaults)


def test_stops_on_done_action():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "click", "x": 1, "y": 2})], response_id="r1"),
            response([computer_call({"type": "done"})], response_id="r2"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(client, fake_computer)

    assert isinstance(result, ActResult)
    # done is terminal -> not executed, but the prior click was executed.
    assert ("click", (1, 2)) in fake_computer.calls
    # one action (the click) executed before the terminal action.
    assert result.steps_taken == 1
    # loop ended via terminal action -> ModelTerminated verifies success.
    assert result.status == "success"


def test_stops_on_message_only():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([message("all finished")], response_id="r1"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(client, fake_computer)

    assert result.steps_taken == 0
    assert result.status == "success"
    assert result.summary == "all finished"
    assert not fake_computer.did("click")


def test_respects_max_steps():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "click", "x": 1, "y": 2})], response_id=f"r{i}")
            for i in range(10)
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(client, fake_computer, guardrails=Guardrails(max_steps=3))

    assert result.status == "max_steps"
    clicks = [c for c in fake_computer.calls if c[0] == "click"]
    assert len(clicks) == 3
    assert result.steps_taken == 3


def test_continue_call_carries_previous_response_id_and_output():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "click", "x": 1, "y": 2}, call_id="call_abc")], response_id="r1"),
            response([computer_call({"type": "done"})], response_id="r2"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    _run(client, fake_computer)

    # First call: initial, no previous_response_id, has tools.
    first = fake_responses.calls[0]
    assert "previous_response_id" not in first
    assert "tools" in first

    # Second call: continuation carrying previous_response_id + computer_call_output.
    second = fake_responses.calls[1]
    assert second["previous_response_id"] == "r1"
    item = second["input"][0]
    assert item["type"] == "computer_call_output"
    assert item["call_id"] == "call_abc"
    assert item["output"]["type"] == "input_image"


def test_guardrail_blocks_off_domain_navigate():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "navigate", "url": "https://evil.com/x"})], response_id="r1"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(client, fake_computer, guardrails=Guardrails(allowed_domains=["good.com"]))

    assert result.status == "blocked"
    assert not fake_computer.did("navigate")


def test_guardrail_allows_on_domain_navigate():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "navigate", "url": "https://good.com/x"})], response_id="r1"),
            response([computer_call({"type": "done"})], response_id="r2"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(client, fake_computer, guardrails=Guardrails(allowed_domains=["good.com"]))

    assert result.status != "blocked"
    assert "https://good.com/x" in fake_computer.navigated_urls


def test_guardrail_blocks_forbidden_action():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "navigate", "url": "https://good.com/x"})], response_id="r1"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(client, fake_computer, guardrails=Guardrails(forbidden_actions=["navigate"]))

    assert result.status == "blocked"
    assert not fake_computer.did("navigate")


def test_html_contains_success():
    fake_computer = FakeComputer(html_content="<html>WELCOME aboard</html>")
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "done"})], response_id="r1"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(
        client,
        fake_computer,
        success_check=HtmlContains(type="html_contains", value="WELCOME"),
    )

    assert result.status == "success"


def test_html_contains_failure():
    fake_computer = FakeComputer(html_content="<html>nope</html>")
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "done"})], response_id="r1"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(
        client,
        fake_computer,
        success_check=HtmlContains(type="html_contains", value="WELCOME"),
    )

    assert result.status == "failed"


def test_extract_runs_tools_off_call_and_parses_json():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([computer_call({"type": "done"})], response_id="r1"),
            response([message('[{"a":1}]')], response_id="r_extract"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(
        client,
        fake_computer,
        extract=ExtractSpec(prompt="extract the rows", format="json"),
    )

    assert result.extracted == [{"a": 1}]
    # the last create call is the extract call -> tools-off.
    last = fake_responses.calls[-1]
    assert "tools" not in last
    assert last["previous_response_id"] == "r1"


def test_api_error_returns_error_status():
    class Boom(FakeResponses):
        def create(self, **kwargs):
            raise RuntimeError("boom")

    fake_computer = FakeComputer()
    client = FakeLightcone(responses=Boom(), computer=fake_computer)

    result = _run(client, fake_computer)

    assert result.status == "error"
    assert "boom" in (result.error or "")


def test_answer_matches_against_message_text():
    fake_computer = FakeComputer()
    fake_responses = FakeResponses(
        [
            response([message("The total is 42 dollars")], response_id="r1"),
        ]
    )
    client = FakeLightcone(responses=fake_responses, computer=fake_computer)

    result = _run(
        client,
        fake_computer,
        success_check=AnswerMatches(type="answer_matches", pattern=r"\d+ dollars"),
    )

    assert result.status == "success"
