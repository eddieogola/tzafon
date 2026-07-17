# Python suite

The Python half of the Lightcone docs-conformance tests. For what the suite *is*, how to run it,
and the bug findings, see the top-level [README](../README.md), [RUNBOOK](../RUNBOOK.md), and
[DOCS-BUGS](../DOCS-BUGS.md). This file only covers the Python tree and its language-specific quirks.

## Layout

```
py/
├── main.py              # entry point — imports every aggregator; comment/uncomment to choose what runs
├── pyproject.toml       # deps, managed by uv
├── uv.lock
├── prices.json          # state written by the price-tracker tutorial (a real run mutates it)
├── utils/
│   ├── example.py       # @example decorator, check(), summary(), the exit code, the 600s watchdog
│   ├── coords.py        # to_px() / scale_coordinates() — 0-999 model space -> pixels
│   └── term.py          # ANSI colours
└── auto/                # one package per docs section, one module per docs page
    ├── getting_started/     quickstart · authentication · how_lightcone_works
    ├── using_northstar/     tasks · run_a_task · responses_api · cua_protocol · coordinates · chat_completions
    ├── environments/        computers · operate · execute_shell · manage_browser_tabs · lightcone_os
    ├── tutorials/           automate_form · login_scrape · price_tracker
    ├── use_cases/           software_testing · legacy_software · cross_app_workflows · docs_validation
    ├── production/          observability · production · errors · logins_and_sessions
    ├── cookbook/            warm_sessions_and_self_healing · verified_structured_extraction · wrap_a_legacy_app_in_an_api
    └── integrations/        langchain · browser_use · playwright · kernel
```

Each `auto/<section>/` is a package (has `__init__.py`). Each module maps to one docs page; each
`@example`-tagged function maps to one anchor on that page; a `<page>_guide(client)` aggregator at
the bottom calls them in order. `main.py` imports and calls the aggregators.

## Anatomy of a module

```python
from utils.example import example, check

PAGE = "guides/quickstart"

@example(PAGE, "3-give-northstar-a-task", title="Quickstart: Give Northstar a Task")
def quickstart(client):
    for event in client.agent.tasks.start_stream(...):
        print(event)

def quickstart_guide(client):     # aggregator, referenced by main.py
    quickstart(client)
```

The decorator derives the `Reference:` URL from `PAGE` + anchor, times the call, records
pass/fail, and enforces the watchdog. Use `check(cond, msg)` to fail an example on its own
verification — a bare `print("failed")` still counts as a pass. See the RUNBOOK's "passing is not
working" section.

## Language-specific notes

- **Toolchain:** [uv](https://docs.astral.sh/uv/). `uv sync` installs; `uv run main.py` runs;
  `uv run python -c "..."` drives a single module (see RUNBOOK §1).
- **Lint:** ruff (`uvx ruff check auto/`). `.ruff_cache/` is local, gitignored.
- **`pyproject.toml`** is `uv init` scaffolding — `name = "py"`, no `[build-system]`. Nothing is ever
  built or published; it exists only to pin deps and drive the venv.
- **`recording.mp4`** appears here after `production/observability::record_session_to_mp4` runs (needs
  `ffmpeg`). Gitignored.

## Python-vs-TypeScript asymmetries (intentional)

The two suites mirror each other, with two deliberate exceptions:

- **`cookbook/` is Python-only.** Those three docs pages have no TypeScript tab, so there is no
  `ts/auto/cookbook/`. Inventing one would break the docs-mirroring rule.
- **`integrations/` differs by language on purpose.** Python has `browser_use` (a Python framework);
  TypeScript has `mastra` and `vercelAi` (TypeScript frameworks). `langchain`, `playwright`, and
  `kernel` exist in both. A missing integration is only a gap if the docs page offers that language's
  tab — check before "filling it in".
