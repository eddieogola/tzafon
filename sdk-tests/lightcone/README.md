# Lightcone SDK Tests

Docs-conformance tests for the Python and TypeScript Lightcone SDKs.

Every runnable example on [docs.lightcone.ai](https://docs.lightcone.ai) should exist here, in both
languages, and still work. When an example drifts from the docs — or the docs drift from the
SDK — this suite is how you find out.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v10+)
- [Python](https://www.python.org/) (3.12+)
- [uv](https://docs.astral.sh/uv/)
- [Make](https://www.gnu.org/software/make/)

## Setup

### 1. Environment variables

```bash
cp .env.example .env
```

Set `TZAFON_API_KEY`. Set `KERNEL_API_KEY` too if you want the Kernel integration to run —
without it, `kernel_integration` fails with `Invalid or disabled API key`.

### 2. Install dependencies

```bash
make install       # both
make install-ts    # pnpm install in ts/
make install-py    # uv sync in py/
```

## Running

```bash
make test          # Python, then TypeScript
make test-py
make test-ts
```

Each run prints a summary and **exits non-zero if any example failed**, so it works in CI:

```
==============================================================
  Summary
==============================================================

  FAIL  Streaming Execution
        https://docs.lightcone.ai/guides/shell-commands/#streaming-execution
        NotFoundError: Error code: 404 - Session not found

19/20 passed in 114.12s
```

### Choosing what runs

Comment/uncomment the calls in `py/main.py` and `ts/main.ts`. Most are off by default —
the agentic examples make billed LLM calls and take minutes each.

A full run is ~80 examples across both languages and costs real money.

## How a test is written

One docs **page** → one module. One docs **anchor** → one function, tagged with the page and
anchor it demonstrates:

```python
from utils.example import example

PAGE = "guides/quickstart"

@example(PAGE, "3-give-northstar-a-task", title="Quickstart: Give Northstar a Task")
def quickstart(client):
    for event in client.agent.tasks.start_stream(...):
        print(event)
```

```ts
const quickstart = example(
  { page: PAGE, anchor: "3-give-northstar-a-task", title: "Quickstart: Give Northstar a Task" },
  async (client: Lightcone): Promise<void> => { ... },
);
```

The decorator owns the banner, the timing, the error capture, and the `Reference:` URL —
which is **derived** from `page` + `anchor`, never hand-typed. A URL you can't typo is a URL
that can't silently 404 when the docs rename a heading.

Keep example bodies looking like the docs. A reader should be able to diff them by eye; that's
the point of the suite. Don't wrap SDK calls in helpers.

### Per-example timeout

Examples get a 600s wall-clock budget (`DEFAULT_TIMEOUT_SECONDS` in `py/utils/example.py`).
This exists because a task event stream can wedge mid-task — it stops emitting without ever
sending `completed` or `failed`, and the client's `timeout=` only covers individual HTTP
requests, not the gap between stream events. Without the guard, one hung example blocks the
whole run indefinitely (observed: 58 minutes on a single `start_stream` call).

Override per example with `@example(..., timeout=1200)`.

## Project structure

```
.
├── .env                  # API keys (not committed)
├── Makefile
├── py/
│   ├── main.py           # entry point + which examples run
│   ├── utils/
│   │   ├── example.py    # @example decorator, summary(), exit code, timeout guard
│   │   ├── coords.py     # to_px() — 0-999 model space -> pixels
│   │   └── term.py
│   └── auto/             # one dir per docs section, one module per page
└── ts/                   # mirror of the above
```

## Known failures

These fail for reasons outside this repo. Don't "fix" them here:

| Example | Cause |
|---|---|
| `Streaming Execution` (py + ts) | `computers.exec.create()` returns no output and destroys the session. Reproducible on desktop and browser. |
| `browser_tool_for_agents` | Docs document `TzafonBrowserTool`; `langchain_tzafon` doesn't export it. |
| `langchainIntegration` (ts) | Docs say `npm install @langchain/tzafon`. That package doesn't exist on npm (404). |
| `kernel_integration` | Needs `KERNEL_API_KEY`. |

## Where the docs are wrong

Verified against the live API and the shipped packages. **The docs are not reliable ground
truth for SDK surface** — every conflict found so far has gone against the docs:

- **Tab fields**: the API returns `is_main` and `tab_id`. Docs say `is_main_tab` and `id`.
- **`TzafonLoader`**: signature is `(urls, api_key, text_content)`. Docs pass `kind="browser"`,
  which raises `TypeError`.
- **`responses.delete()`**: doesn't exist. The API is `create` / `retrieve` / `cancel`.
- **`computer_use`**: correct, and the API accepts it — but the TypeScript SDK's Responses
  types are inherited from OpenAI's schema and only know `computer_use_preview`, so
  `responses.create` needs an `as any` cast in TS.
- **Task event stream**: typed as `string` in both SDKs, but yields structured events.
- **Batch actions**: `go_to_url` is supported (it's in the SDK's own docstring) but absent from
  the docs' action list.

When docs and reality disagree, run the code and believe the run.

## Gotchas

- **Node + WSL2**: `pnpm dev` sets `NODE_OPTIONS=--network-family-autoselection-attempt-timeout=500`.
  Node's default 250ms is too short for the IPv6 path to fail over in WSL2, and every request dies
  with `fetch failed / ETIMEDOUT`. curl and Python fall back to IPv4 on their own; Node doesn't.
- **`noUnusedLocals`** fights the comment-out selection style: commenting a call out in an
  aggregator makes TypeScript flag the example as unused. That's why `main.ts` has
  `void availableExamples`.
- `tsc` isn't a dependency — `npx tsc` resolves to an unrelated package. Use
  `npx -p typescript@5.9 tsc --noEmit`.
