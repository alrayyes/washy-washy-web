// @stryker-mutator/core has no official Bun runner yet (open upstream
// request). `@hughescr/stryker-bun-runner` is chosen over
// `stryker-mutator-bun-runner` (npm's `latest` is 0.4.0, published
// 2025-07-07, peer-pinned to `@stryker-mutator/core ^9.0.0`, effectively
// abandoned) and over falling back to `@stryker-mutator/jest-runner` (this
// repo's suite imports from "bun:test", which doesn't exist outside the Bun
// runtime — running it under real Jest would mean rewriting every test file,
// not a drop-in fallback). `@hughescr/stryker-bun-runner` ships frequent
// releases and is built specifically for `bun:test` per-test coverage via
// Bun's Inspector Protocol. Same evaluation `alrayyes/washy-washy-core`#67
// already did; see that repo's PR #72 for the full writeup.
//
// Pinned to 1.4.0, not 1.3.8: 1.3.8 has a confirmed bug where a mutant that
// defeats the runner's own `testFiles` override lets `bun test` fall through
// to auto-discovery and re-spawn itself from inside a spawn it already made,
// with nothing to stop the nesting — unbounded process growth, not a slow
// run (upstream's own A/B: "20% at 11min (ETA ~54min)" before the fix,
// "completes in 7m52s" after, on the same machine and Stryker version). Hit
// live in this repo's own CI on #249, the first PR to ever put
// `src/i18n/ui.ts` (2210 mutants, 11 locale dictionaries) through the
// mutation job: a clean 100%/0-timeout/2m28s run locally against 1.3.8
// timed out on ~90%+ of mutants in CI regardless of `--concurrency` (tried
// both 4 and 2 — lower concurrency made the *wall clock* worse, which is
// what pointed at unbounded process growth rather than resource contention
// as the actual mechanism). 1.4.0's "Stop runaway recursive bun test spawns
// leaking process trees" is the fix; see
// github.com/hughescr/stryker-bun-runner's 1.3.8...1.4.0 compare for the
// full writeup, including the process-group/depth-limiting mechanism.
//
// `@stryker-mutator/core` stays pinned to 9.6.1 rather than jumping to the
// current 10.0.0: 1.4.0 widened the runner's own peer range to
// `^9.0.0 || ^10.0.0`, so a 10.0.0 upgrade is possible now, but it's a
// separate, deliberate major-version bump this fix doesn't also make.
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
  // exercises directly — src/lib/**/*.ts and src/i18n/**/*.ts, plus the
  // handful of .tsx pieces below that turned out to be pure render logic
  // (props/hooks in, markup out, nothing touching window/document/refs) once
  // #219 actually went looking. urlHistory.ts, previously excluded here, is
  // included too now — see that file's own history for why.
  //
  // #219's two holes, and what closed each:
  //
  // Hole 1 — every .tsx/.astro file was outside this glob entirely. Most of
  // them still are, .svelte now rather than .tsx for the ones already
  // ported (#239): HeaderUpload/ConfigViewer/MachineEditor/SheetViewer/
  // WarningBanner/KeyboardNav/ThemeToggle all read window/document/refs
  // directly (file uploads, clipboard, matchMedia, native <dialog>, scroll
  // position) and every .astro page needs Astro's own render pipeline, not
  // React's — mutating any of that would still only produce unkillable
  // NoCoverage mutants under bun:test, the same blind spot codecov.yml
  // documents for e2e-covered DOM-interaction code. That's a deliberate,
  // permanent call: they stay e2e-only.
  //
  // But four files turned out to have *no* DOM surface at all — all four
  // now deleted, their Svelte ports (or, for Sheet.tsx, nothing at all —
  // ConfigViewer.tsx duplicated its own read-only rendering rather than
  // importing it) taking their place in the list below: Sheet.tsx
  // (module-level, confirmed by grep — no window/document/useRef/useEffect
  // anywhere in it; test/sheet-render.test.ts has quietly unit-tested it via
  // `renderToStaticMarkup` since #21, years before mutation testing existed
  // here), dials.tsx's ProgramDial/IronDial (pure geometry-to-SVG functions),
  // SectionHeading.tsx (one string transform), and TranslationProvider.tsx
  // (a Context provider plus two hooks, no DOM types anywhere in its
  // signature). None of these needed a DOM shim (jsdom/happy-dom): React's
  // own `react-dom/server` rendered a real, correct markup string for a pure
  // component without ever touching a `window`. A DOM-capable layer for the
  // genuinely interactive components above was investigated and rejected —
  // getting those to a real 100% would mean re-deriving most of Playwright's
  // own coverage through a mocked DOM, for components already exercised by
  // real clicks in a real browser (e2e/*.spec.ts).
  //
  // Hole 2 — urlHistory.ts was excluded even though it's a plain .ts file:
  // its own module graph reaches `window`, which tsconfig.test.json
  // deliberately has no types for (see url.ts's doc comment, which draws
  // this same line for its sibling file). test/support/windowShim.d.ts now
  // gives tsconfig.test.json's program a minimal, hand-written `window`
  // shape — just `location.pathname` and `history.replaceState`, the only
  // two members this file touches — instead of pulling the full "DOM" lib
  // into every other test file's type-checking. test/url-history.test.ts
  // stands up a real object matching that shape at runtime (Bun itself has
  // no `window` global either) and calls `writeUrlFilters` directly.
  //
  // This is the full local-audit scope (currently a genuine 100%, verified
  // 2026-09-11) — `bun run mutation` with no arguments checks all of it.
  // CI's own `mutation` job in `.github/workflows/check.yml` narrows this
  // further at invocation time, via `stryker run --mutate <changed files>`,
  // to just the files a given PR actually touched: rules/testing.md tracks
  // pre-existing mutation-testing debt as its own issue and gates new/
  // changed code only, rather than blocking unrelated work on gaps it
  // didn't introduce. There's no debt in this scope right now, but the CI
  // job is written the same way regardless, since the remaining .tsx/.astro
  // layer is exactly that kind of permanent, out-of-scope exclusion rather
  // than debt to burn down.
  mutate: [
    "src/lib/**/*.ts",
    "src/i18n/**/*.ts",
    // The Svelte ports of dials.tsx/SectionHeading.tsx (#243's first
    // stage) — dials.tsx, SectionHeading.tsx and TranslationProvider.tsx
    // are all deleted now (#245 was their last consumer), so there's
    // nothing left to list alongside these. dialGeometry.ts is the
    // plain-TS geometry math shared by both new dials, and the
    // instrumenter has a native Svelte transformer/printer
    // (transformers/svelte-transformer.js), so these mutate the same way
    // any other pure-render source here does.
    "src/lib/dialGeometry.ts",
    "src/components/ProgramDial.svelte",
    "src/components/IronDial.svelte",
    "src/components/SectionHeading.svelte",
    // Sheet.tsx's own Svelte port (#243's second stage) — Sheet.tsx itself
    // is deleted once this lands (nothing else needs the React version),
    // so it's replaced here rather than added alongside. CardActions.svelte
    // is the one sub-component that became its own file instead of a
    // snippet (see its own doc comment for why); everything else in the
    // original Sheet.tsx is a snippet inside Sheet.svelte itself.
    "src/components/Sheet.svelte",
    "src/components/CardActions.svelte",
  ],
  // Auto-discovery finds every *.test.ts *and* the Playwright specs under
  // e2e/ (which import from "@playwright/test", not "bun:test") and tries
  // to run them as bun:test files, which fails outright. Restrict to the
  // same directory package.json's own "test" script uses.
  //
  // `bunArgs` mirrors that same script's own `--conditions=browser` (see
  // `test/support/svelteCompile.ts`'s own comment on why it's needed at
  // all): unlike `check.yml`'s own `bun test` invocation, Stryker's bun
  // runner builds its invocation from scratch rather than running
  // `package.json`'s "test" script, so this flag has to be repeated here
  // explicitly or `test/sheet-actions.test.ts`'s own `mount`/`unmount`
  // calls resolve to Svelte's server build and throw
  // `lifecycle_function_unavailable` on every single test in that file —
  // confirmed live.
  bun: {
    testFiles: ["test"],
    bunArgs: ["--conditions=browser"],
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
