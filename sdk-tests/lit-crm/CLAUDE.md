# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

`lit-crm` is a new, mostly-empty Python project inside the larger `tzafon` workspace. There is no committed source yet — when scaffolding, follow the conventions below rather than inventing new ones, since the surrounding SDK-test projects already establish them.

## Package management: uv

Use **uv** for all Python dependency and environment management. Do not use `pip`, `poetry`, `venv`, or `conda` directly.

```bash
uv sync                       # install/resolve deps from pyproject.toml + uv.lock
uv add <pkg>                  # add a runtime dependency
uv add --dev <pkg>            # add a dev/test dependency
uv run <cmd>                  # run a command inside the project environment
uv run python main.py         # run the entrypoint
```

The project targets **Python >=3.12** (matching the other SDK projects in this workspace). A `pyproject.toml` + `uv.lock` pair is the source of truth — commit both.

## Test-driven development

This project follows TDD. The workflow for any change is **red → green → refactor**:

1. Write a failing `pytest` test that pins the desired behavior *before* writing implementation.
2. Run the test, confirm it fails for the expected reason.
3. Write the minimum code to make it pass.
4. Refactor with the test as a safety net.

Tests use `pytest` (add it with `uv add --dev pytest`). Conventional commands:

```bash
uv run pytest                         # run the whole suite
uv run pytest tests/test_foo.py       # run a single test file
uv run pytest tests/test_foo.py::test_case   # run one test
uv run pytest -k "expr"               # run tests matching an expression
uv run pytest -x -q                   # stop on first failure, quiet
```

Keep tests under `tests/`, mirroring the package layout. Do not write implementation code for a behavior that has no failing test driving it.

## Lightcone SDK & workspace conventions

This project lives under `tzafon/sdk-tests/` alongside Lightcone SDK examples; a CRM here is expected to drive the **Tzafon Lightcone** browser-automation SDK.

- The `tzafon` package exposes `Lightcone`, constructed with an API key plus `timeout` / `max_retries`:
  ```python
  from tzafon import Lightcone
  client = Lightcone(api_key=os.getenv("TZAFON_API_KEY"), timeout=30.0, max_retries=3)
  ```
- Secrets come from the workspace `.env` (loaded via `python-dotenv`). The only secret is `TZAFON_API_KEY`. `.env` is git-ignored — never commit it or hard-code the key.
- A **Lightcone MCP server** (`@tzafon/mcp-server`) is configured at the workspace root (`.mcp.json`) and enabled for this project in `.claude/settings.local.json`. Prefer its tools when interacting with Lightcone interactively.
- **Points of reference** (consult these before guessing the API surface):
  - Python API reference — https://docs.lightcone.ai/api/python — the `tzafon`/Lightcone client: installation, sync & async usage, error handling, type definitions, config options, logging, and custom HTTP client setup.
  - Manual & examples — https://docs.lightcone.ai/ — Northstar (computer-use model) overview, quickstart, authentication, and guides for autonomous tasks, custom automation loops, direct computer control, and text generation.
- Staging (`api-staging.tzafon.ai`) requires a *different* key from production; do not assume the prod key works against staging.

## Reference examples

Working, runnable Lightcone usage (both Python and TypeScript) lives in sibling directories such as `../lightcone/sdks/25-05/py/` — including `pyproject.toml` (uv), a `main.py` entrypoint, an `auto/` package of guides/tutorials, and a `Makefile` with `make install-py` (`uv sync && uv run playwright install chromium`) and `make test-py` (`uv run main.py`). Mine these for current SDK patterns before writing new integration code.
