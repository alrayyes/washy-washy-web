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
// Don't go back to a runner older than 1.4.0: 1.3.8 can re-spawn `bun test`
// from inside its own spawn, with nothing to stop the nesting.
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
  // The mutation scope is src/lib, src/i18n and the components listed below.
  // The other components and the .astro pages aren't mutated; the e2e suite
  // covers them.
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
