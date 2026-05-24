# Persistent-VM resume benchmark (curl)

Pure-`curl` scripts that exercise Lightcone's **persistent computer** feature and measure
how long a persisted VM takes to "resume". Targets the **staging** API
(`https://api-staging.tzafon.ai`) by default.

## What "persistent / resume" means here

Lightcone has **no literal stop/resume**. The lifecycle is:

1. `POST /computers` with `persistent:true` → returns an `id`. State saves on teardown.
2. Do work on the computer.
3. `DELETE /computers/{id}` → state is persisted to the DB.
4. **Resume** = `POST /computers` again with `environment_id:<original_id>` + `persistent:true`,
   which restores the saved state into a *new live session* (new `id`, same environment lineage).

So the **resume benchmark** = time for that restore-create call + time until the first action
succeeds (`time_to_usable`).

## Prerequisites

- `curl` and `jq` on `PATH` (`brew install jq`).
- A valid `TZAFON_API_KEY` in `../.env` (i.e. `sdks/18-05/.env`).
- Make the scripts executable once: `chmod +x *.sh`.

## The three steps

```bash
cd sdks/18-05/curl

# A. Create + uniquely mark N persistent desktop VMs (default 3).
./1-create-and-mark.sh 3
#    -> writes state/environments.tsv  (label, environment_id, created_at, screenshot_url)
#    Open a screenshot_url to visually confirm each VM's MARKER / Desktop file.

# B. Resume + benchmark + verify the marker. Label this run.
./2-resume-and-benchmark.sh "day0"
#    -> appends one row per VM to state/benchmark.csv, prints PASS/FAIL.

# C. ~24h later, run B again, then summarize.
./2-resume-and-benchmark.sh "day1"
./3-summary.sh
#    -> per VM: each run's resume / time_to_usable and the delta vs the first run.
```

The marker is a unique line (`<label> | <environment_id> | created <iso>`) written to
`/root/MARKER.txt` (and `/root/Desktop/WHO_AM_I.txt` for the screenshot). On resume we
`cat` it back — if it still contains this VM's label *and* environment id, persistence held and
we resumed the **correct** VM.

**Browser search (visual proof).** In addition to the marker file, each step launches Firefox on
the desktop and Googles the VM's label, then screenshots — so a screenshot literally shows
`<label> - Google Search`. Step A does this at setup; step B re-opens it *after* the timed section
(so it never pollutes the benchmark) to let you eyeball that the resumed VM is the correct one.
Disable with `BROWSER_SEARCH=0` for pure timing. Screenshot URLs are recorded
(`environments.tsv` for step A, the `confirm_shot_url` column of `benchmark.csv` for step B).

## Output files (git-ignored, under `state/`)

- `environments.tsv` — the persistent VMs created in step A.
- `benchmark.csv` — one row per (run, VM): `resume_time_s`, `time_to_ready_s`, `exec_time_s`,
  `time_to_usable_s`, `marker_ok`, `notes`, `confirm_shot_url`.
- `screenshots/` — reserved for downloaded shots (URLs are recorded in `environments.tsv`).

## Configuration (env vars)

| Var | Default | Meaning |
|---|---|---|
| `BASE_URL` | `https://api-staging.tzafon.ai` | API host (set to `https://api.tzafon.ai` for prod) |
| `VM_KIND` | `desktop` | `desktop` (full-disk persistence + shell) or `browser` |
| `MAX_LIFETIME_SECONDS` | `900` | Hard cap so nothing is left orphaned |
| `READY_TIMEOUT_SECONDS` | `90` | How long to poll for a ready status on resume |
| `BROWSER_SEARCH` | `1` | `1` = open browser + search the label; `0` = skip (pure timing) |
| `BROWSER_BIN` | `firefox` | Browser binary on the desktop (Firefox is preinstalled on staging) |
| `SEARCH_URL_TEMPLATE` | `https://www.google.com/search?q=%s` | `%s` is replaced by the label |
| `BROWSER_RENDER_SECONDS` | `9` | Wait after launch before screenshot (cold-start) |

## Notes / caveats

- **Environment lineage:** we always resume from the **original** `environment_id` saved in
  `environments.tsv`. If staging instead re-keys the environment on each save (so only the most
  recent `restored_id` is resumable), switch the loop in `2-resume-and-benchmark.sh` to update the
  stored id to the latest `restored_id` after each run. The first run will tell you which behavior
  applies (does `day1` still resume the same id?).
- **Timing:** per-call latency uses `curl -w %{time_total}` (sub-second); `time_to_usable` uses
  whole-second wall-clock (macOS `date` has no `%N`).
- A failed resume or a mismatched marker is recorded as **FAIL**, not silently skipped — that's the
  signal step C is looking for.
- The TS sample (`../ts/main.ts`) reads `LIGHTCONE_API_KEY`; these scripts use `TZAFON_API_KEY`
  (matching `.env` and the API docs). Pre-existing mismatch, unrelated to these scripts.
