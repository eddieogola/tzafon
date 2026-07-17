# TypeScript suite

The TypeScript half of the Lightcone docs-conformance tests. For what the suite *is*, how to run it,
and the bug findings, see the top-level [README](../README.md), [RUNBOOK](../RUNBOOK.md), and
[DOCS-BUGS](../DOCS-BUGS.md). This file only covers the TypeScript tree and its language-specific quirks.

## Layout

```
ts/
├── main.ts              # entry point — imports every aggregator; comment/uncomment to choose what runs
├── package.json         # deps + the `dev` script (pnpm)
├── pnpm-lock.yaml
├── tsconfig.json        # strict, noUnusedLocals, @/* path alias
├── prices.json          # state written by the price-tracker tutorial (a real run mutates it)
├── utils/
│   ├── example.ts       # example() wrapper, check(), summary(), the exit code
│   ├── coords.ts        # toPx() / scaleCoordinates() — 0-999 model space -> pixels
│   └── term.ts          # ANSI colours
└── auto/                # one dir per docs section, one module per docs page
    ├── getting-started/     quickstart · authentication · howLightconeWorks
    ├── using-northstar/     tasks · runATask · responsesApi · cuaProtocol · coordinates · chatCompletions
    ├── environments/        computers · operate · executeShell · manageBrowserTabs · lightconeOs
    ├── tutorials/           automateForm · loginScrape · priceTracker
    ├── use_cases/           softwareTesting · legacySoftware · crossAppWorkflows · docsValidation
    ├── production/          observability · production · errors · loginsAndSessions
    └── integrations/        langchain · playwright · kernel · mastra · vercelAi
```

Each module maps to one docs page; each `example()`-wrapped function maps to one anchor; a
default-exported `<name>Guide(client)` aggregator calls them in order. `main.ts` imports and awaits
the aggregators.

## Anatomy of a module

```ts
import { example, check } from "@/utils/example";

const PAGE = "guides/quickstart";

const quickstart = example(
  { page: PAGE, anchor: "3-give-northstar-a-task", title: "Quickstart: Give Northstar a Task" },
  async (client: Lightcone): Promise<void> => {
    const stream = await client.agent.tasks.startStream({ /* ... */ });
    for await (const event of stream) console.log(event);
  },
);

export default async function quickstartGuide(client: Lightcone): Promise<void> {
  await quickstart(client);
}
```

The wrapper derives the `Reference:` URL from page + anchor, times the call, and records pass/fail.
Use `check(cond, msg)` to fail an example on its own verification — a bare `console.log("failed")`
still counts as a pass. See the RUNBOOK's "passing is not working" section.

## Language-specific notes / gotchas

- **Toolchain:** pnpm + [tsx](https://tsx.is/) (runs TypeScript directly, no build step). `pnpm dev`
  is the entry point; it's `make test-ts`.
- **`pnpm dev` sets `NODE_OPTIONS=--network-family-autoselection-attempt-timeout=500`.** On WSL2,
  Node's default 250 ms is too short to fail over from IPv6 to IPv4 and *every* request dies with
  `fetch failed / ETIMEDOUT`. If you run a module outside `pnpm dev`, set this yourself. (RUNBOOK §4.)
- **`tsc` is not a dependency.** `npx tsc` runs an unrelated decoy package. Typecheck with
  `npx -p typescript@5.9 tsc --noEmit -p tsconfig.json`. Expect ~815 errors inside `node_modules`
  (`@mastra/core` vs pinned `zod`/`ai`) and ~48 in our files (documented SDK-type gaps — DOCS-BUGS
  §4.4/§4.8). Zero **syntax** errors is the bar.
- **`noUnusedLocals` fights the comment-out selection style.** Commenting a call out in `main.ts`
  leaves its import "unused" and fails the typecheck — which is why `main.ts` ends with
  `void availableExamples;` (a map that references every import so none reads as unused). Keep it.
- **Directory casing is inconsistent:** `getting-started` and `using-northstar` are kebab-case, but
  `use_cases` is snake-case (it predates the others). `production` is one word and sidesteps the
  issue. Match the existing directory when adding a file; don't rename.

## TypeScript-vs-Python asymmetries (intentional)

- **No `cookbook/`.** Those three docs pages are Python-only (no TypeScript tab), so the Cookbook
  section lives only in `py/auto/cookbook/`.
- **`integrations/` differs by language on purpose.** TypeScript has `mastra` and `vercelAi`
  (TypeScript frameworks); Python has `browser_use` (a Python framework). `langchain`, `playwright`,
  and `kernel` exist in both. A missing integration is only a gap if the docs page offers that
  language's tab.
- **`langchain` fails by design here:** the docs say `npm install @langchain/tzafon`, but that
  package was never published (DOCS-BUGS §2.6). The Python `langchain-tzafon` is real; the TypeScript
  one does not exist.
