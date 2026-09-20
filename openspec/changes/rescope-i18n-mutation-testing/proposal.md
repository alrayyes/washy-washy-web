# Proposal

## Why

`src/i18n/ui.ts` is permanently excluded from CI's mutation-testing job
(`#251`, concluded in `eeaff33`) because its 2210 mutants — by far the
largest mutation target in the repo — make CI's per-mutant `bun test`
sandboxing too heavy to finish inside a reasonable job timeout at any
concurrency setting tried. But the file's own test suite
(`test/ui.test.ts`) shows those 2210 mutants aren't buying much: it asserts
structural invariants — every locale has the same keys as English, no
locale has an empty value, `translator()`'s lookup/fallback/interpolation
behavior — and never hard-codes an individual translated string's content.
Stryker's default string-literal mutator turns a dictionary value into
`""`, which the existing "no empty string values" test already catches for
every key in every locale; that's the entire reason all ~2200
dictionary-content mutants report as killed. Mutating what a French or
Russian translation actually _says_ isn't tested at all — it can't be, by
design, since nothing should hard-code translated prose. The mutation
count is dominated by content that mutation testing has no real leverage
over, and that inflated count is the direct cause of `ui.ts`'s permanent
CI exclusion.

## What Changes

- Scope Stryker's `mutate` target for `src/i18n/ui.ts` to `translator()`
  and its interpolation logic only, excluding the `dictionaries` object
  literal's string values from mutation. The dictionaries keep being type-
  checked and covered by `bun run typecheck` and `test/ui.test.ts`'s
  structural assertions; those assertions stop being exercised via
  mutation and are relied on directly instead.
- Revert `#251`'s permanent `src/i18n/ui.ts` exclusion from CI's mutation
  job (`.github/workflows/check.yml`) now that the file's real mutant
  count (just `translator()`'s logic, not 11 locales of dictionary
  content) is back in line with every other file the job already covers.
- Update `stryker.config.mjs`'s and `check.yml`'s comments describing the
  `#251` exclusion to reflect this resolution, replacing the "permanent,
  deliberate trade-off" language with the actual fix.
- No change to what's tested or how thoroughly translations are verified
  for correctness — `test/ui.test.ts`'s existing key-parity and non-empty
  checks, plus `e2e/i18n.spec.ts`'s rendered-output checks, are exactly the
  checks that were ever actually doing that job.

## Capabilities

### New Capabilities

- `ci/mutation-testing`: what CI's mutation-testing job is required to
  cover, and the rule for what kind of source (logic vs. static data) is
  in scope for mutation at all.

### Modified Capabilities

(none — no existing capability specs yet; this is the first spec covering
mutation-testing scope)

## Impact

- `stryker.config.mjs`: `mutate` list gains a way to target `ui.ts`'s
  logic without its dictionaries (Stryker's `mutate`/`ignore` support
  either a narrower glob or an in-file `// Stryker disable` comment
  region around the `dictionaries` literal — design.md picks one).
- `.github/workflows/check.yml`: the `mutation` job's changed-files filter
  drops its `:(exclude)src/i18n/ui.ts` pathspec; its long `#251` comment
  block is rewritten to describe the resolution instead of the exclusion.
- No application code changes; no test behavior changes; no runtime
  impact. Expected effect is CI mutation job wall-clock time and mutant
  count for `ui.ts`-touching PRs dropping sharply, and `ui.ts` rejoining
  the set of files CI's mutation gate actually protects.
