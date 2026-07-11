# Spec: Add Tzafon as a provider on models.dev

**Status:** Draft — local working doc, do NOT commit this file or include it in the PR.
**Author:** Simon (Tzafon) + Claude
**Date:** 2026-07-01
**Target repo:** `anomalyco/models.dev` (this repo), branch off `dev`.

---

## 1. Background

### 1.1 What models.dev is

[Models.dev](https://models.dev) is an open-source, community-maintained database of AI
model specs, pricing, and capabilities, run by the SST/Anomaly team. The data lives as
TOML files in this repo (`providers/<id>/provider.toml` + `providers/<id>/models/*.toml`),
is validated by `bun validate` (Zod schemas in `packages/core/src/schema.ts`), and is
compiled into public API endpoints (`https://models.dev/api.json`, `models.json`,
`catalog.json`). It is the model registry consumed by [opencode](https://opencode.ai)
and keyed by AI SDK model IDs — so a Tzafon entry makes `tzafon.northstar-cua-fast`
resolvable/selectable in opencode and any AI SDK-based tool that reads the catalog.

### 1.2 How the repo is governed (why this spec is shaped the way it is)

Findings from an analysis of ~2,000 merged and ~617 closed-unmerged PRs (June 2025 → July 2026):

- **Effectively single-maintainer.** `rekram1-node` (Aiden Cline) performs ~86% of all
  merges. Median merge time for human PRs is ~4 hours; 80% merge within 24h.
- **An automated review bot posts "AUTOMATED REVIEW: Blocking merge: …" comments**
  enforcing a compliance checklist. Formal GitHub approvals are essentially unused.
- **A stale bot closes PRs after 30 days of inactivity — or just 7 days after
  maintainer feedback** (`.github/workflows/close-stale-pull-requests.yml`). Most
  new-provider PRs die here, not from explicit rejection. Maintainer policy (PR #2714):
  *"I am going to close prs that dont comply automatically because often times people
  never come back to update them."*
- **The de-facto acceptance test is the model actually working** when the maintainer
  tries it (he has held/reverted models he couldn't access himself, e.g. PRs #857, #912),
  and he verifies data against the live API (*"If i run sync models myself the current
  limits are accurate and your changes are wrong"*, #1651).
- **New-provider compliance bar** (from closing comments on rejected provider PRs
  #2697, #1956, #2714, #2045, #1909): `base_model` syntax where applicable, explicit
  `reasoning_options` for reasoning models, square `currentColor` logo, and
  *"plz add sync script if possible."*
- **Provider-employee-maintained entries are preferred** over community drive-bys: the
  maintainers displaced community PRs in favor of official ones for Poe (#374 over #137)
  and W&B (#2755 over #2969). Submitting this officially from Tzafon is an advantage —
  say so in the PR body.
- **Policy-level exclusions** (none apply to Tzafon): non-$/token pricing (Straico,
  #133), upstream ToS conflicts (Cline, #2048), local/self-hosted servers (#893, #1199),
  and mega-sweep PRs touching hundreds of models (#1349).

### 1.3 What the Tzafon/Lightcone API offers

- **OpenAI-compatible Chat Completions** at `https://api.tzafon.ai/v1`
  (`POST /v1/chat/completions`, `GET /v1/models`). Streaming, tool calling
  (`tools`, `tool_choice`), `response_format` (`json_object` / JSON schema),
  `temperature`, `max_completion_tokens` all supported.
- **Auth:** Bearer token, `TZAFON_API_KEY` env var (keys start with `sk_`, issued at
  the lightcone.ai developer dashboard).
- Works today with the AI SDK via `createOpenAI({ baseURL: "https://api.tzafon.ai/v1" })`
  — see `~/Development/sdk/lightcone-api-docs/src/content/docs/integrations/vercel-ai.mdx`.
- There is also an OpenAI-compatible **Responses API** for the computer-use loop
  (`computer_call` actions, `input_image` screenshots). models.dev only catalogs the
  chat-completions surface; the Responses API is a docs link, not a catalog concern.

### 1.4 Model visibility — CRITICAL scoping rule

The `/v1/models` listing is **key-scoped**:

- **Admin keys** (like Simon's) see everything, including `tzafon.internal.*`
  checkpoints (11 models as of 2026-07-01).

models.dev must reflect **what a regular user can see and use**. Everything in this spec
filters accordingly. Never let an admin-keyed sync run leak internal checkpoints into
the public catalog.

```ts
// The one filter that matters everywhere:
const isPublic = (id: string) =>
  id.startsWith("tzafon.")
```

---

## 2. Verified facts (probed 2026-07-01 against the live API)

### 2.1 Public models

| Model ID | `created` | Context (probed) | Pricing (docs) | Notes |
|---|---|---|---|---|
| `tzafon.northstar-cua-fast` | 2026-04-22 | **262,144** | $0.50 / $1.50 per M in/out | CUA model, image input |
| `tzafon.northstar-cua-fast-1.6` | 2026-05-09 | **131,072** | ⚠️ not on pricing page | CUA model, image input |

Context windows were obtained by sending an oversized `max_completion_tokens` and reading
the vLLM-style error:

```
$ curl -s https://api.tzafon.ai/v1/chat/completions \
    -H "Authorization: Bearer $TZAFON_API_KEY" -H "Content-Type: application/json" \
    -d '{"model":"tzafon.northstar-cua-fast","messages":[{"role":"user","content":"hi"}],"max_completion_tokens":9999999}'

{"error":{"message":"max_completion_tokens=9999999cannot be greater than
  max_model_len=max_total_tokens=262144. ..."}}
```

`max_total_tokens` is a *shared* input+output budget (no separate completion cap), which
informs the `[limit]` values below.

### 2.2 Docs ↔ API mismatches (fix on the Tzafon side BEFORE the PR)

1. **`tzafon.northstar-cua-faster` does not exist.** Both `chat-completions.mdx` and
   `pricing.mdx` list it; the API returns `{"error":"model not found: \"tzafon.northstar-cua-faster\""}`.
   Either fix the docs to say `-faster-1.6` or add a server-side alias. The models.dev
   maintainer *will* try the documented ID.
2. **The `-1.6` variants have no published pricing.** models.dev requires `[cost]` with a
   citable source. Add them to the pricing page (or decide they're not public catalog
   models and exclude them here).
3. **`tzafon.sm-1` timed out on a trivial completion** (HTTP 000, possibly a cold pool).
   Verify it's healthy; the maintainer testing a dead model is an instant hold.


## 3. Deliverables

```
providers/tzafon/
├── provider.toml
├── logo.svg                                     # square, currentColor
└── models/
    ├── tzafon.northstar-cua-fast.toml
    ├── tzafon.northstar-cua-fast-1.6.toml
packages/core/src/sync/providers/tzafon.ts        # sync module (§4.4)
packages/core/src/sync/index.ts                   # register provider + group (edit)
```

No `models/` (provider-agnostic metadata) entries for now: `base_model` factoring is for
models served by multiple providers or with existing canonical metadata. Tzafon's models
are first-party and single-provider — full inline definitions are correct (per README:
"otherwise the full provider model definition must be present in the file"). If
OpenRouter/aggregators pick up Northstar later, canonical `models/tzafon/*.toml` entries
get created then and the provider TOMLs get refactored to `base_model` pointers.

### 3.1 `providers/tzafon/provider.toml`

```toml
name = "Tzafon"
npm = "@ai-sdk/openai-compatible"
api = "https://api.tzafon.ai/v1"
env = ["TZAFON_API_KEY"]
doc = "<PUBLIC DOCS URL — pricing or models page>"  # TODO: canonical URL (docs.tzafon.ai?)
```

Notes:
- `npm = "@ai-sdk/openai-compatible"` + `api` is the repo's documented pattern for
  providers without their own AI SDK package. (`@tzafon/lightcone` is a Stainless SDK,
  not an AI SDK provider — don't put it in `npm`.)
- `env` must list the var(s) tools should read for auth; `TZAFON_API_KEY` only.

### 3.2 `providers/tzafon/logo.svg`

Requirements (README + review-thread enforcement, PRs #138, #321, #2159):
- **Square** viewBox (review-only rule: *"can u make this square?"*).
- **No fixed width/height on the root**, no hardcoded colors — use `currentColor`
  for fills/strokes.

The existing `lightcone-api-docs/public/lightcone.svg` is a 132×28 wordmark with
`fill="none"` on the root and hardcoded path fills — **not compliant as-is**. Extract the
leading 28×28 rounded-square icon mark, re-viewBox it to be square, and replace fixed
fills with `currentColor`. Verify it renders legibly in both light and dark themes
(models.dev renders logos in both).

### 3.3 Model TOMLs — full contents

Conventions that apply to every file (from AGENTS.md + review-bot findings):
- Filename **is** the model ID; `id` is auto-injected — **never** put `id` in the TOML.
- Schema is `.strict()` — unknown fields fail validation.
- Keep the `# evidence:` comments — sync tooling was explicitly patched to preserve
  TOML comments (PRs #2973, #2880) and reviewers ask for sources on limits/pricing.
- `reasoning = false` for all four models → **no** `reasoning_options`, **no**
  `[interleaved]` (both only apply to reasoning models; getting this wrong is the
  single most common AUTOMATED REVIEW block in the repo).

`providers/tzafon/models/tzafon.northstar-cua-fast.toml`:

```toml
name = "Northstar CUA Fast"
attachment = true # accepts screenshot/image input
reasoning = false
tool_call = true
structured_output = true # response_format: json_object / json schema
temperature = true
release_date = "2026-04-22" # /v1/models created timestamp
last_updated = "2026-06-26" # price drop announced in docs pricing page
open_weights = false

[cost]
# https://<docs>/guides/pricing — "Price drop — June 26, 2026"
input = 0.50
output = 1.50

[limit]
# probed 2026-07-01: max_model_len=max_total_tokens=262144 (shared input+output budget)
context = 262_144
input = 262_144
output = 262_144

[modalities]
input = ["text", "image"]
output = ["text"]
```

`providers/tzafon/models/tzafon.northstar-cua-fast-1.6.toml`:

```toml
name = "Northstar CUA Fast 1.6"
attachment = true
reasoning = false
tool_call = true
structured_output = true
temperature = true
release_date = "2026-05-09" # /v1/models created timestamp
last_updated = "2026-05-09"
open_weights = false

[cost]
# TODO: publish on pricing page first; assumed same as northstar-cua-fast
input = 0.50
output = 1.50

[limit]
# probed 2026-07-01: max_model_len=max_total_tokens=131072
context = 131_072
input = 131_072
output = 131_072

[modalities]
input = ["text", "image"]
output = ["text"]
```

`providers/tzafon/models/tzafon.northstar-cua-faster-1.6.toml` — **only if stably
listed** (§2.3). Same shape; `release_date = "2026-06-26"`, context/input/output
`65_536`, pricing $0.50/$1.50 per the docs table for the "faster" tier (publish first).

`providers/tzafon/models/tzafon.sm-1.toml`:

```toml
name = "SM-1"
attachment = false
reasoning = false
tool_call = true
structured_output = true
temperature = true
release_date = "2026-02-09" # /v1/models created timestamp
last_updated = "2026-02-09"
open_weights = false

[cost]
# https://<docs>/guides/pricing
input = 0.20
output = 0.30

[limit]
# TODO: probe once the pool is healthy (§2.2 item 3); placeholder MUST be replaced
context = 131_072
input = 131_072
output = 131_072

[modalities]
input = ["text"]
output = ["text"]
```

Open metadata questions to resolve internally (all optional fields — fine to omit if
unknown, do NOT guess): `knowledge` (training cutoff, `YYYY-MM`), `family`
(e.g. `family = "northstar"` for the three CUA models — repo convention: dots not
dashes, keep major version), whether a separate completion cap exists (would change
`limit.output`), and exact release dates if the `created` timestamps are deployment
dates rather than launch dates.

---

## 4. Suggested implementation approach

### Phase 0 — Tzafon-side prerequisites (blocks everything else)

1. Fix the `tzafon.northstar-cua-faster` docs/API mismatch (§2.2.1).
2. Publish pricing for every model that will be cataloged (§2.2.2).
3. Verify `tzafon.sm-1` health and probe its context limit (§2.2.3).
4. Stabilize the public `/v1/models` listing (§2.3).
5. Decide the catalog set: recommendation — `northstar-cua-fast`, `sm-1`, plus the
   `-1.6` variants only if they're stable, priced, and meant for public consumption.
6. Pick the public docs URL for `provider.toml`'s `doc` field.

### Phase 1 — Data files

1. Branch off `dev` (e.g. `add-tzafon-provider`).
2. Add `provider.toml`, `logo.svg`, model TOMLs per §3.
3. Run `bun validate` until green — the maintainer does not merge red CI
   (*"Guys ci is failing i don't merge the prs that have failing ci haha"*, #652).

### Phase 2 — Sync module (include in the SAME PR)

The maintainer asks new providers for a sync script (*"plz add sync script if
possible"*, #2697) — shipping it up front avoids a feedback round-trip and its 7-day
stale clock. Follow `sync.md` + existing modules in `packages/core/src/sync/providers/`
(`chutes.ts` and `ovhcloud.ts` are the closest templates: public-ish OpenAI-style
listing, sparse metadata).

`packages/core/src/sync/providers/tzafon.ts` sketch:

```ts
import { z } from "zod"

const TzafonModel = z.object({
  id: z.string(),
  created: z.number(),
  object: z.literal("model"),
  features: z.array(z.string()).optional(),
})
const TzafonResponse = z.object({ data: z.array(TzafonModel) })

const PUBLIC = (id: string) =>
  id.startsWith("tzafon.")

export const provider = {
  id: "tzafon",
  name: "Tzafon",
  modelsDir: "providers/tzafon/models",
  async fetchModels() {
    // TZAFON_API_KEY optional: unauthenticated/user-scoped listing is already
    // public-only; an admin key must never widen the synced set (PUBLIC() enforces).
    const headers: Record<string, string> = {}
    if (process.env.TZAFON_API_KEY)
      headers.Authorization = `Bearer ${process.env.TZAFON_API_KEY}`
    return fetch("https://api.tzafon.ai/v1/models", { headers })
      .then((r) => r.json())
  },
  parseModels(raw) {
    return TzafonResponse.parse(raw).data.filter((m) => PUBLIC(m.id))
  },
  translateModel(model, context) {
    const existing = context.existing(model.id)
    // /v1/models only exposes id/created/features — NOT authoritative for pricing,
    // limits, modalities, or capabilities. Like the google/xai modules: report new
    // models in .sync/model-sync-report.md, do not fabricate catalog entries.
    if (!existing) return undefined // surfaces as "new model" in the report
    return {
      id: model.id,
      model: {
        ...existing,
        // created is the only field the API is authoritative for; keep
        // hand-authored release_date when present.
        release_date: existing.release_date ?? isoDate(model.created),
      },
    }
  },
} satisfies SyncProvider<z.infer<typeof TzafonModel>>
```

Key design decisions (mirror the repo's google/xai precedent, and see §2.3):
- **Do not auto-create** new models — the API lacks authoritative pricing/limits/
  modalities. Report them in `.sync/model-sync-report.md` instead.
- **Preserve hand-authored fields** — the API is authoritative for almost nothing yet.
- **Deletion caution:** the shared runner deletes files missing from the synced set.
  Given §2.3 volatility, until the public listing is provably stable, consider
  returning skipped-but-existing models from `translateModel` (i.e. never signal
  deletion) and let removals be manual. `sync.md`: *"a provider module should only skip
  source models when deleting existing local files for those skipped IDs is intentional."*
- Register in `packages/core/src/sync/index.ts` under the `direct` group (Tzafon is a
  first-party model creator, not an aggregator). Keep it out of shared groups if
  behavior is still ambiguous (sync.md's own advice).
- No new secrets needed in `.github/workflows/sync-models.yml` if the listing works
  unauthenticated; if a key is required, it must be a **regular-user** key, and the
  workflow needs the secret wired in (actions are pinned by SHA — keep that).

Test loop (from sync.md): `bun models:sync tzafon --dry-run` → inspect → `bun
models:sync tzafon` → `--dry-run` again expecting clean → `bun validate`.

### Phase 3 — End-to-end verification (before opening the PR)

```bash
bun install
cd packages/web && bun run build
OPENCODE_MODELS_PATH="dist/_api.json" opencode
# select tzafon/tzafon.northstar-cua-fast with TZAFON_API_KEY set (a REGULAR user
# key, not admin), run a real completion + a tool call
```

Working-in-opencode is the maintainer's de-facto acceptance test — arrive with it
already proven, ideally with a transcript/screenshot in the PR body.

### Phase 4 — The PR

- One small PR: provider + models + sync module. Nothing else.
- PR body: state this is an **official submission from Tzafon** with a commitment to
  maintain the entries; link pricing/docs pages for every number; note the probe
  methodology for context limits; include the opencode verification.
- Expect the AUTOMATED REVIEW bot; fix findings **within days** (7-day stale clock
  after any maintainer feedback).
- Expected review gates, in order of likelihood: green CI → data matches live API →
  pricing sources → logo squareness/currentColor → opencode usability.

---

## 5. DO's

- **DO** test with a **regular-user API key**, not the admin key — the maintainer's
  view of `/v1/models` is the regular-user view.
- **DO** fix the docs/API mismatches on the Tzafon side *before* opening the PR (§2.2).
- **DO** keep evidence comments in TOMLs (pricing URLs, probe dates) — repo convention,
  tooling preserves them.
- **DO** include the sync module in the initial PR (compliance-bar item since ~June 2026).
- **DO** run `bun validate` and the sync dry-run loop locally until clean.
- **DO** verify in opencode end-to-end and say so in the PR body.
- **DO** identify the PR as Tzafon-official with a maintenance commitment.
- **DO** respond to review feedback within a couple of days (7-day auto-close).
- **DO** use conventional-commit style with provider scope: `feat(tzafon): add Tzafon provider`.
- **DO** keep `reasoning = false` models free of `reasoning_options`/`[interleaved]`.

## 6. DONT'S


- **DON'T** put `id` inside any model TOML (auto-injected from filename; strict schema
  fails on extra fields).
- **DON'T** use `base_model` / create `models/` metadata entries yet — first-party,
  single-provider models are defined inline; refactor only when a second provider
  serves them.
- **DON'T** use the legacy `[extends]` syntax anywhere (migrated away 2026-06; instant
  review block).
- **DON'T** guess optional metadata (`knowledge`, `family`, dates) — omit rather than
  fabricate; wrong values get caught against the live API.
- **DON'T** list models that regular users can't reach (e.g. the currently-vanished
  `-faster-1.6` until it's stable, or the docs' nonexistent bare `-faster` ID).
- **DON'T** let the sync module auto-create or auto-delete models while `/v1/models`
  is volatile (§2.3, §4.4).
- **DON'T** put `@tzafon/lightcone` in `npm` — it's not an AI SDK provider package.
- **DON'T** hardcode logo colors or dimensions; don't ship the rectangular wordmark.
- **DON'T** bundle unrelated changes (web tweaks, other providers) into the PR;
  mega-PRs rot and get closed (#1349, the 2026-05-21 conflict sweep).
- **DON'T** commit `.sync/model-sync-report.md` from local runs (sync.md rule).
- **DON'T** commit this spec file.

---

## 7. Open questions (resolve before or during Phase 0)

1. Public docs URL for `doc =` (canonical site URL isn't set in the docs repo's
   `astro.config.ts`).
2. Is there a separate max-completion cap, or is output genuinely bounded only by the
   shared 262K/131K/64K budget? (Affects `limit.output`.)
3. `tzafon.sm-1` context window + health (probe failed).
4. Knowledge cutoffs and `family` values, if we want them (optional).
5. Are `created` timestamps launch dates or deployment dates?
6. Is `-faster-1.6` (and the `-1.6` line generally) meant to be public catalog surface?
7. Should Tzafon's `/v1/models` grow pricing/limit metadata so the sync module can
   eventually become authoritative (like OpenRouter's) instead of report-only?
