/**
 * Docs-conformance harness.
 *
 * Each example function is tagged with the docs page and anchor it
 * demonstrates. The Reference URL is derived from that tag rather than
 * hand-written, so it cannot silently drift from the docs. Failures are
 * recorded rather than swallowed; `summary()` reports them and yields the
 * process exit code.
 */

import { Colors } from "@/utils/term";

export const DOCS_BASE = "https://docs.lightcone.ai";

export type Meta = {
  /** Docs path, e.g. "guides/quickstart". */
  page: string;
  /** Heading id on that page, e.g. "go-deeper". */
  anchor?: string;
  /** Banner title, matching the docs section. */
  title: string;
};

export type Result = {
  title: string;
  url: string;
  ok: boolean;
  duration: number;
  error: unknown;
};

const _results: Result[] = [];

/** Build a docs URL from a page path and optional anchor. */
export function docsUrl(page: string, anchor?: string): string {
  const url = `${DOCS_BASE}/${page.replace(/^\/+|\/+$/g, "")}/`;
  return anchor ? `${url}#${anchor}` : url;
}

/**
 * Tag a function as the runnable example for one docs anchor.
 *
 * `page` and `anchor` are data: the Reference URL is computed from them,
 * and they are what a coverage check would diff against the live docs.
 */
export function example<A extends unknown[], R>(
  meta: Meta,
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R | undefined> {
  const url = docsUrl(meta.page, meta.anchor);

  const wrapped = async (...args: A): Promise<R | undefined> => {
    console.log(`${Colors.YELLOW}*** ${meta.title} ***${Colors.RESET}\n`);
    console.log(`Reference: ${Colors.BLUE}${url}${Colors.RESET}\n`);

    const startTime = Date.now();
    let error: unknown = null;
    try {
      return await fn(...args);
    } catch (e) {
      error = e;
      console.log(`\n${Colors.RED}Error in ${meta.title}: ${e}${Colors.RESET}\n`);
      return undefined;
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      _results.push({ title: meta.title, url, ok: error === null, duration, error });
      console.log(
        `\n${Colors.GREEN}Execution time: ${duration.toFixed(2)} seconds${Colors.RESET}\n`,
      );
    }
  };

  Object.defineProperty(wrapped, "example", { value: { ...meta, url } });
  return wrapped;
}

/** Every example that has run so far, in order. */
export function results(): Result[] {
  return [..._results];
}

/** Print a run summary. Returns the exit code: 1 if anything failed. */
export function summary(): number {
  if (_results.length === 0) {
    console.log(`${Colors.YELLOW}No examples ran.${Colors.RESET}\n`);
    return 0;
  }

  const failed = _results.filter((r) => !r.ok);
  const total = _results.length;
  const elapsed = _results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`${Colors.YELLOW}${"=".repeat(62)}${Colors.RESET}`);
  console.log(`${Colors.YELLOW}  Summary${Colors.RESET}`);
  console.log(`${Colors.YELLOW}${"=".repeat(62)}${Colors.RESET}\n`);

  for (const r of failed) {
    const name = r.error instanceof Error ? r.error.name : "Error";
    const message = r.error instanceof Error ? r.error.message : String(r.error);
    console.log(`${Colors.RED}  FAIL${Colors.RESET}  ${r.title}`);
    console.log(`        ${r.url}`);
    console.log(`        ${name}: ${message}\n`);
  }

  const passed = total - failed.length;
  const color = failed.length ? Colors.RED : Colors.GREEN;
  console.log(
    `${color}${passed}/${total} passed${Colors.RESET} in ${elapsed.toFixed(2)}s\n`,
  );

  return failed.length ? 1 : 0;
}
