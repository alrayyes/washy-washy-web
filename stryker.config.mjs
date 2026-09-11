// @stryker-mutator/core has no official Bun runner yet (open upstream
// request). `@hughescr/stryker-bun-runner` is chosen over
// `stryker-mutator-bun-runner` (npm's `latest` is 0.4.0, published
// 2025-07-07, peer-pinned to `@stryker-mutator/core ^9.0.0`, effectively
// abandoned) and over falling back to `@stryker-mutator/jest-runner` (this
// repo's suite imports from "bun:test", which doesn't exist outside the Bun
// runtime — running it under real Jest would mean rewriting every test file,
// not a drop-in fallback). `@hughescr/stryker-bun-runner` ships frequent
// releases (18 versions between January and July 2026, latest 1.3.8) and is
// built specifically for `bun:test` per-test coverage via Bun's Inspector
// Protocol. Same evaluation `alrayyes/washy-washy-core`#67 already did; see
// that repo's PR #72 for the full writeup.
//
// `@stryker-mutator/core` is pinned to 9.6.1, not the current 10.0.0: the bun
// runner still peer-depends on `^9.0.0` (`@stryker-mutator/core@10.0.0`
// shipped 2026-08-14, after the runner's last release).
//
// Unlike washy-washy-core, this repo's pinned `typescript` (6.0.3) is the
// classic compiler, not the Go rewrite — `require("typescript")` exposes the
// full API here, so the `inPlace: true` workaround that repo needed for
// `ts.parseConfigFileTextToJson is not a function` doesn't apply. Stryker's
// normal sandbox-copy behaviour (the default, `inPlace: false`) is used
// instead.
/** @type {import("@stryker-mutator/api/core").PartialStrykerOptions} */
export default {
  // Stryker's default plugin glob is "@stryker-mutator/*" — the bun runner
  // lives outside that scope, so it has to be named explicitly.
  plugins: ["@hughescr/stryker-bun-runner"],
  testRunner: "bun",
  coverageAnalysis: "perTest",
  // Scoped to the pure-logic modules this repo's own `bun:test` suite
  // exercises directly — src/lib/**/*.ts and src/i18n/**/*.ts (the glob
  // suffix ".ts" already excludes TranslationProvider.tsx, the one .tsx file
  // in src/i18n/). Every other .tsx component and every .astro page is
  // DOM-interaction UI code that codecov.yml already documents as covered by
  // the Playwright e2e suite instead, not by bun:test — Stryker's bun runner
  // has the same blind spot Codecov does here, so mutating that code would
  // only ever produce unkillable NoCoverage mutants, not real gaps in the
  // unit suite this job is meant to guard.
  // urlHistory.ts is excluded even though it's a plain .ts file: it's the
  // one file in src/lib whose own module graph reaches `window` (see its
  // sibling url.ts's doc comment, which spells this exact split out —
  // "the root tsconfig has no DOM lib ... a plain function [url.ts] is
  // worth unit-testing from the root test/ suite — which only works
  // because nothing in this file's module graph reaches window"). Pulling
  // it into a test/ file breaks `tsc --noEmit -p tsconfig.test.json`'s own
  // deliberately DOM-less program, and it's already exercised for real by
  // e2e/sheet.spec.ts, the same "DOM-interaction UI code is e2e's job"
  // split codecov.yml documents for everything else excluded below.
  //
  // This is the full local-audit scope (currently a genuine 100%, verified
  // 2026-09-11) — `bun run mutation` with no arguments checks all of it.
  // CI's own `mutation` job in `.github/workflows/check.yml` narrows this
  // further at invocation time, via `stryker run --mutate <changed files>`,
  // to just the files a given PR actually touched: rules/testing.md tracks
  // pre-existing mutation-testing debt as its own issue and gates new/
  // changed code only, rather than blocking unrelated work on gaps it
  // didn't introduce. There's no debt in *this* scope right now, but the
  // CI job is written the same way regardless, since the two intentional
  // holes below (the .tsx/.astro layer, urlHistory.ts) are exactly that
  // kind of tracked gap — see #219.
  mutate: ["src/lib/**/*.ts", "!src/lib/urlHistory.ts", "src/i18n/**/*.ts"],
  // Auto-discovery finds every *.test.ts *and* the Playwright specs under
  // e2e/ (which import from "@playwright/test", not "bun:test") and tries
  // to run them as bun:test files, which fails outright. Restrict to the
  // same directory package.json's own "test" script uses.
  bun: {
    testFiles: ["test"],
  },
  // Default concurrency (nproc, 16 here) spawns that many concurrent `bun
  // test` children, each paying the full suite's module-load cost
  // (pdf-lib, @washy-washy/pdf's PDF rendering, react-dom/server) — that's
  // what OOM-killed an earlier run on this machine (31GiB RAM). 4 keeps
  // peak RSS well under budget at some cost to wall time.
  concurrency: 4,
  thresholds: {
    high: 100,
    low: 100,
    break: 100,
  },
  reporters: ["html", "clear-text", "progress"],
};
