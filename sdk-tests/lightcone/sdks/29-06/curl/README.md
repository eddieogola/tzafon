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
   which restores the saved state into a _new live session_ (new `id`, same environment lineage).

So the **resume benchmark** = time for that restore-create call + time until the first action
succeeds (`time_to_usable`).

## Prerequisites

- `curl` and `jq` on `PATH` (`brew install jq`).
- A valid `TZAFON_API_KEY` in `curl/.env` (copy `.env.example` to `.env`), or exported in your
  shell — an exported value takes precedence over the file.
- Make the scripts executable once: `chmod +x *.sh`.

## The three steps

```bash
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
`cat` it back — if it still contains this VM's label _and_ environment id, persistence held and
we resumed the **correct** VM.

**Browser search (visual proof).** In addition to the marker file, each step launches Firefox on
the desktop and Googles the VM's label, then screenshots. Step A searches just the label
(`<label> - Google Search`). Step B appends the **run label** so day0 vs day1 screenshots are
distinguishable — e.g. `bravo day0` then `bravo day1` (spaces are URL-encoded to `+`). Step B does
this _after_ the timed section (so it never pollutes the benchmark) to let you eyeball that the
resumed VM is the correct one. Disable with `BROWSER_SEARCH=0` for pure timing. Screenshot URLs are
recorded (`environments.tsv` for step A, the `confirm_shot_url` column of `benchmark.csv` for step B).

## Output files (git-ignored, under `state/`)

- `environments.tsv` — the persistent VMs created in step A.
- `benchmark.csv` — one row per (run, VM); appended each time you run step B (see columns below).
- `screenshots/` — reserved for downloaded shots (URLs are recorded in `environments.tsv`).

### `benchmark.csv` columns

| Column             | Meaning                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run_label`        | The label you passed to `2-resume-and-benchmark.sh` (e.g. `day0`, `day1`). Groups a run; defaults to an ISO timestamp if omitted.                                |
| `run_iso`          | UTC time the run executed (ISO 8601, e.g. `2026-05-25T16:22:03Z`).                                                                                               |
| `vm_label`         | The VM's phonetic name (`alpha`, `bravo`, …), taken from `environments.tsv`.                                                                                     |
| `environment_id`   | The original persistent environment id (from step A). This is what we resume from; stable across runs.                                                           |
| `restored_id`      | The new live session id returned by **this** resume. Changes every run; empty if the resume failed.                                                              |
| `resume_http_code` | HTTP status of the resume `POST /computers` call. `201` = success; anything ≥400 is a failed resume.                                                             |
| `resume_time_s`    | Wall-time of the resume API call alone (`curl %{time_total}`, sub-second).                                                                                       |
| `time_to_ready_s`  | Whole seconds spent polling `GET /computers/{id}` until status was running/ready (`0` if ready immediately).                                                     |
| `exec_time_s`      | Wall-time of the first real action — the `cat MARKER` `exec/sync` call (`curl %{time_total}`).                                                                   |
| `time_to_usable_s` | **Headline metric.** Whole-second wall-clock from resume start until the marker read succeeded (resume + ready + first action). Empty if it never became usable. |
| `marker_ok`        | `yes`/`no` — did the resumed VM's `MARKER.txt` contain this VM's label **and** `environment_id`? Proves correct VM + persistence.                                |
| `notes`            | Failure reason when something went wrong (e.g. `resume_http_401`, `no_restored_id`, `marker_mismatch`); empty on success.                                        |
| `confirm_shot_url` | Screenshot URL of the post-resume browser search (`<label> <run_label>`). Empty when `BROWSER_SEARCH=0` or the screenshot failed.                                |

## Configuration (env vars)

| Var                      | Default                              | Meaning                                                            |
| ------------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| `BASE_URL`               | `https://api-staging.tzafon.ai`      | API host (set to `https://api.tzafon.ai` for prod)                 |
| `VM_KIND`                | `desktop`                            | `desktop` (full-disk persistence + shell) or `browser`             |
| `MAX_LIFETIME_SECONDS`   | `900`                                | Hard cap so nothing is left orphaned                               |
| `READY_TIMEOUT_SECONDS`  | `90`                                 | How long to poll for a ready status on resume                      |
| `BROWSER_SEARCH`         | `1`                                  | `1` = open browser + search the label; `0` = skip (pure timing)    |
| `BROWSER_BIN`            | `firefox`                            | Browser binary on the desktop (Firefox is preinstalled on staging) |
| `SEARCH_URL_TEMPLATE`    | `https://www.google.com/search?q=%s` | `%s` is replaced by the label                                      |
| `BROWSER_RENDER_SECONDS` | `9`                                  | Wait after launch before screenshot (cold-start)                   |

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
