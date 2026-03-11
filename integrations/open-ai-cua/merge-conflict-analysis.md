# Merge Conflict Analysis: `tzafon-integration` vs `main`

**Date:** 2026-03-11
**Branch:** `tzafon-integration`
**Repo:** `openai-cua-sample-app`

## Root Cause

Main branch rewrote the entire project from a Python app to a TypeScript monorepo (Next.js + Fastify + pnpm workspaces).

Key commits on main since divergence:

- `6a14341` — "Polish TypeScript CUA sample for OSS release"
- `3751c8b` — Merge PR #67 (GPT-5.4 update)

The `tzafon-integration` branch modified Python code to add Tzafon browser support, so every Python file touched now conflicts because main deleted the entire Python codebase.

## Conflicting Files

| File | Conflict Type | Details |
|---|---|---|
| `.env.example` | Both modified (UU) | Main replaced Python env vars with TypeScript runner/web vars; our branch added `TZAFON_API_KEY`, `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, `SCRAPYBARA_API_KEY` |
| `README.md` | Both modified (UU) | Main rewrote the entire README for the new TS architecture; our branch had Tzafon-specific documentation |
| `computers/config.py` | Deleted on main, modified by us (UD) | Main removed all Python code |
| `computers/contrib/__init__.py` | Deleted on main, modified by us (UD) | Main removed all Python code |
| `requirements.txt` | Deleted on main, modified by us (UD) | Main dropped Python entirely |

## New TypeScript Structure on Main

- `apps/demo-web/` — Next.js operator console
- `apps/runner/` — Fastify runner (manages workspaces, browser sessions, SSE, replay bundles)
- `packages/browser-runtime/` — Browser runtime (replaces Python `computers/`)
- `packages/runner-core/` — Core runner logic, responses loop
- `packages/replay-schema/` — Replay artifact schema
- `packages/scenario-kit/` — Scenario manifests (booking, kanban, paint)

## Resolution Options

### Option 1: Port Tzafon Integration to TypeScript

Re-implement the Tzafon browser integration in the new TypeScript codebase. The relevant packages are:

- `packages/browser-runtime/` — where browser backends live
- `packages/runner-core/src/responses-loop.ts` — the canonical Responses API integration point
- `.env.example` — add `TZAFON_API_KEY`

### Option 2: Accept Main's Deletions, Add Config Only

Accept all of main's changes (delete Python files), then add Tzafon-specific environment variables to the new `.env.example` and update `README.md` with Tzafon setup instructions.

## Our Branch Commits

- `44b0f1d` — feat: Add TzafonBrowser integration for remote browser control
- `374c8e3` — chore: Update Python dependencies in requirements.txt
