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
// both 4 and 2 — lower concurrency made the *wall clock* worse). 1.4.0's
// "Stop runaway recursive bun test spawns leaking process trees" is a
// real, confirmed fix for a real bug; see
// github.com/hughescr/stryker-bun-runner's 1.3.8...1.4.0 compare for the
// full writeup, including the process-group/depth-limiting mechanism. It
// did not, on its own, explain #249's actual CI timeout rate, though —
// #251 spent five real CI runs chasing the real mechanism (confirmed
// concurrency 2 still being worse than 4 wasn't this bug either,
// retested fresh against 1.4.0, same result) and concluded it's a real,
// permanent constraint of this runner class against a file `ui.ts`'s
// size, not a fixable bug: see `.github/workflows/check.yml`'s mutation
// job for the full writeup. #265 later scoped `ui.ts`'s own mutant count
// down (excluding the locale dictionaries' string literals from
// mutation, via the inline `// Stryker disable StringLiteral` pairs in
// the file itself) rather than fixing this runner-class constraint, so
// `ui.ts` is back in CI's mutation job despite it.
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
  // lives outside that scope, so it has to be named explicitly. Once
  // `plugins` is set at all, the default glob no longer applies on top of
  // it, so the typescript checker (which *would* have matched the default
  // glob on its own) needs to be listed here too.
  plugins: ["@hughescr/stryker-bun-runner", "@stryker-mutator/typescript-checker"],
  testRunner: "bun",
  coverageAnalysis: "perTest",
  // A mutant that wouldn't even compile fails fast as a CompileError
  // instead of wasting a full test run finding out the same thing
  // (rules/javascript.md's mutation-testing section). Checks straight
  // against `tsconfigFile`'s default (tsconfig.json) — the same program
  // `bun run typecheck` already validates src/lib and src/i18n against.
  // A `.svelte` mutant (Sheet.svelte, CardActions.svelte, the dials) isn't
  // part of that plain-tsc program at all, so the checker's own "pass
  // through if the mutated file isn't part of the typescript project"
  // fallback (confirmed by reading typescript-checker.js) applies to all
  // of them — harmless, not a hole this introduces: they're checked by
  // running their tests same as before, same as every mutant already was.
  checkers: ["typescript"],
  // Scoped to the code the `bun:test` suite exercises directly:
  // src/lib/**/*.ts, src/i18n/**/*.ts and the Svelte components that are
  // pure rendering or can be mounted in a test. The other components and
  // every .astro page touch window, document, the clipboard or Astro's own
  // render pipeline, so their mutants would survive under bun:test with no
  // coverage. They stay e2e-only, on purpose.
  //
  // `bun run mutation` with no arguments checks the whole list. CI's
  // `mutation` job in `.github/workflows/check.yml` narrows it with
  // `--mutate <changed files>`, so a pull request answers only for the files
  // it touched. A component added here has to be added there too.
  mutate: [
    "src/lib/**/*.ts",
    "src/i18n/**/*.ts",
    // The geometry both dials share.
    "src/lib/dialGeometry.ts",
    // Parsing a .svelte file needs estree-walker, which Stryker imports from
    // svelte's directory though neither depends on it. Keep the devDependency
    // (test/mutation-parser-deps.test.ts).
    "src/components/ProgramDial.svelte",
    "src/components/IronDial.svelte",
    "src/components/SectionHeading.svelte",
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
  // (pdf-lib, @washy-washy/pdf's PDF rendering, svelte/server) — that's
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
