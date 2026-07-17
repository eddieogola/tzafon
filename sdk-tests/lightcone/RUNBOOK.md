# Runbook — running the tests

Operational guide for anyone (human or agent) who needs to run this suite and read the results.
For *what the suite is* and *how to write a test*, see [README.md](README.md). For *known bugs*, see
[DOCS-BUGS.md](DOCS-BUGS.md).

> **Read this first if you take nothing else away:** a green check does not mean the example works,
> and a full run is **not** meant to be all-green. Both are explained below. People have wasted
> hours here by trusting the pass count.

---

## 0. One-time setup

```bash
cp .env.example .env          # then edit: set TZAFON_API_KEY (required), KERNEL_API_KEY (optional)
make install                  # pnpm install (ts) + uv sync (py)
```

`.env` is gitignored. Never paste a real key into a commit, a PR, or a chat transcript — if you do,
rotate it immediately.

**Before running anything, confirm the key is alive** (they get disabled/rotated; a dead key makes
every example fail identically with `401 Invalid token`, which wastes a whole run):

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $(grep TZAFON_API_KEY .env | cut -d= -f2)" \
  https://api.tzafon.ai/v1/models
# 200 = good.  401 = the key is dead; stop and get a new one.
```

---

## 1. Running the suite

### The whole thing

```bash
make test        # Python then TypeScript
make test-py
make test-ts
```

`make test` runs whatever is **uncommented** in `py/main.py` / `ts/main.ts`. By default that's a
tiny selection — most examples are commented out because they make **billed** LLM calls and take
minutes each. A full run is ~113 examples across both languages and costs real money and ~1 hour.

### Choosing what runs — two levels

1. **Which modules** — comment/uncomment the aggregator calls in `main.py` / `main.ts`.
2. **Which examples inside a module** — some aggregators (e.g. `software_testing`) have inner calls
   commented out too. Check the bottom of the module, not just `main.py`.

### Running one module WITHOUT editing main.py (preferred for spot-checks)

Editing `main.py` dirties the tree and risks clobbering someone's selection. Drive the aggregator
directly instead — this is how you run one page in isolation:

```bash
cd py
timeout 900 uv run python -c "
import os
from dotenv import load_dotenv
load_dotenv('../.env')
from tzafon import Lightcone
from utils.example import summary
from auto.using_northstar.coordinates import coordinates_guide   # <- the module you want
client = Lightcone(api_key=os.environ['TZAFON_API_KEY'], timeout=60.0, max_retries=3)
coordinates_guide(client)
raise SystemExit(summary())
" 2>&1 | tail -60
```

Run modules **separately** so one hang doesn't hide another module's results.

---

## 2. Reading the results

Every run ends with a summary and sets the process exit code:

```
==============================================================
  Summary
==============================================================

  FAIL  Streaming Execution
        https://docs.lightcone.ai/guides/shell-commands/#streaming-execution
        NotFoundError: Error code: 404 - Session not found

19/20 passed in 114.12s
```

- **Exit 0** = everything that ran passed. **Exit non-zero** = at least one example failed. Usable
  in CI.
- Each `FAIL` prints the docs URL it was checking and the exception. That URL is the first place to
  look.

### ⚠ Passing is NOT working

The harness records a failure only when an example **raises**. An example that prints a red error
and returns still counts as a **pass**. Several examples have historically passed while doing
nothing:

- an `ffmpeg`/tool gate that skips silently when a binary is missing
- a liveness probe that can never return `False`
- an `apt-get install` that installs nothing
- a login that never logged in

When you add or review an example that *verifies* something, use `check(condition, message)` from
`utils.example` — it raises `ExampleFailed`, so the harness sees it:

```python
from utils.example import check
check("Logout" in content, "session did not carry over — not authenticated")
```

Do **not** write `if not ok: print("failed")` — that goes green.

### ⚠ A full run is red on purpose

This is a **docs-conformance** suite. Some examples follow the docs faithfully into a bug, and are
*supposed* to fail — turning them green would mean hiding the finding. As of the last full run these
are the intentional/upstream reds; see [DOCS-BUGS.md](DOCS-BUGS.md) for each:

| Example | Why it fails | Fixable here? |
|---|---|---|
| `Coordinates: Responses API Raw Coordinates` | `northstar-cua-fast-1.6` returns `x=0` (§0.1) | No — model bug; docs tell you to pin it |
| `Responses API: Manage Responses` | `responses.cancel` is a 404 (§2.1) | No — docs say `cancel`; it's unimplemented |
| `... Tasks (Fully Managed)`, and other streaming examples | end-of-stream `JSONDecodeError` (§0.2) | No — SDK decoder bug |
| `Streaming Execution` | `exec.create` destroys the session (§0.4) | No — API bug |
| `Event Stream and WebSocket` | `retrieve_events` destroys the session (§0.3) | No — API bug |
| `Coordinates: Chat Completions Full Example` | model omits `y`, crams both into `x` (§4.6) | No — API schema violation |
| `Browser Tool for Agents` | `TzafonBrowserTool` isn't in the package (§2.5) | No — package gap |
| `Kernel: CUA Loop` | needs `KERNEL_API_KEY` | Yes — set the env var |

**Before "fixing" a red, check DOCS-BUGS.md.** If it's listed as LIVE/SDK, the red is the point.
When you hit a *new* failure, classify it: (a) our test code, (b) docs bug, (c) SDK/API bug,
(d) environmental — and only (a) and (d) are yours to fix.

---

## 3. Shell traps that have burned people here

These are not hypothetical — every one cost real time this repo's history.

- **Never pipe a long-running command through `head`.** `tsc ... | head -5` and
  `uv run main.py | head` SIGPIPE the program partway and **truncate silently** — you get a partial
  result that looks complete. Redirect to a file, then inspect the file.
- **Never read `$?` after a pipe.** `cmd | tail` → `$?` is `tail`'s exit code, not `cmd`'s. A failed
  run reads as success. Use `${PIPESTATUS[0]}`, or redirect and check the program directly.
- **`npx tsc` is a decoy.** TypeScript isn't a dependency, so `npx tsc` installs and runs an
  unrelated package ("This is not the tsc command you are looking for"). Use
  `npx -p typescript@5.9 tsc --noEmit -p tsconfig.json`.
- **`sudo` needs a TTY** — it can't run non-interactively here. Anything needing `sudo` (e.g.
  `apt install ffmpeg`) has to be run by a human in a real terminal.

---

## 4. Environment gotchas

- **Node on WSL2 — `fetch failed / ETIMEDOUT` on every request.** DNS returns an IPv6 (NAT64)
  address first; Node's Happy-Eyeballs attempt timeout defaults to 250 ms, too short to fail over to
  IPv4 in WSL2, so every request dies. curl and Python fall back on their own; Node doesn't.
  `pnpm dev` already sets `NODE_OPTIONS=--network-family-autoselection-attempt-timeout=500` to fix
  it. If you run TS outside `pnpm dev`, set that yourself. (Symptom without it: TS suite drops from
  ~13/14 to ~4/9, all "Connection error".)
- **`~815 node_modules type errors`** from `@mastra/core` vs the pinned `zod`/`ai` — pre-existing,
  not yours. Filter them: `tsc ... 2>&1 | grep -v '^node_modules/'`.
- **~48 "our-file" TS errors** are the documented SDK-type gaps (`computer_use` vs
  `computer_use_preview`, the string-typed event stream — DOCS-BUGS §4.4/§4.8). Zero **syntax**
  errors is the bar; those 48 are expected.
- **`ffmpeg`** is needed only by `observability::record_session_to_mp4`. Without it that example
  skips; with it, it produces a real `recording.mp4` (gitignored).

---

## 5. Concurrency & cleanup — spend money carefully

- **Concurrency limit** is plan-dependent; exceeding it returns `429 Concurrent limit reached`. The
  account tested at **≥12** concurrent computers. If you fan out parallel runs, keep peak well under
  that or you'll get false 429 failures that look like bugs. Measure it before assuming:
  loop `computers.create` until the first 429, then delete them all.
- **Always clean up computers you create outside the suite.** The suite's own examples use `with`
  blocks / `finally` and clean themselves up. Ad-hoc probe scripts must `delete()` what they create —
  leaked computers bill until they expire. Check the account is clear when done:

```bash
cd py && uv run python -c "
import os; from dotenv import load_dotenv; load_dotenv('../.env')
from tzafon import Lightcone
c = Lightcone(api_key=os.environ['TZAFON_API_KEY'])
l = c.computers.list(); items = l if isinstance(l, list) else getattr(l, 'data', [])
print('live computers:', len(items))
"
```

---

## 6. Verifying the whole suite is intact (no API calls, no cost)

After any structural change, before running anything billed:

```bash
# every module imports
cd py && uv run python -c "
import importlib, pkgutil, auto
bad = []
for m in pkgutil.walk_packages(auto.__path__, 'auto.'):
    try: importlib.import_module(m.name)
    except Exception as e: bad.append((m.name, type(e).__name__, str(e)[:60]))
print('ALL OK' if not bad else bad)
"

# every @example's derived URL still resolves against the live docs (network, but free)
# see py/utils — walk the registry, fetch each page, diff anchors against <h2 id=...>
```

The second check is the suite's core promise: every `@example(page, anchor)` must point at a heading
that still exists. When the docs rename a section, this is what catches it.

---

## 7. If you're an agent doing a live run

- Drive aggregators directly (§1); don't edit `main.py` — another process may own it.
- Run each module in its own process so one hang doesn't mask others. The Python harness has a 600 s
  per-example watchdog; a run that reaches it is itself a finding.
- Classify every failure (a/b/c/d). Only (a) and (d) are yours. **Don't fix (b)/(c) — report them.**
- Quote the verbatim `Summary` block; don't paraphrase counts.
- When a docs claim conflicts with observed behaviour, **believe the run, not the docs** — that
  conflict has gone against the docs every single time here.
- Withdraw a finding you can't reproduce rather than shipping a guess.
