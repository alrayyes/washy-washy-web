# Tasks

## 1. Exclude dictionary content from mutation

- [x] 1.1 Add a `// Stryker disable StringLiteral` / `// Stryker restore
StringLiteral` pair around each of the 11 locale `const <locale>:
Ui = {...}` blocks in `src/i18n/ui.ts` (`en`, `ja`, `es`, `de`,
      `fr`, `ar`, `zh`, `tr`, `jive`, `linkedin`, `ru`), and verify with
      `grep -c "Stryker disable StringLiteral" src/i18n/ui.ts` that all
      11 pairs are present.
- [x] 1.2 Run `bunx stryker run --mutate src/i18n/ui.ts` locally and
      verify the mutant count drops to roughly `translator()`'s own
      logic (no mutants reported against any locale object's string
      values) with a 100% mutation score.

## 2. Bring `ui.ts` back into CI's mutation job

- [x] 2.1 Remove the `:(exclude)src/i18n/ui.ts` pathspec from
      `.github/workflows/check.yml`'s mutation job changed-files filter,
      and verify with `git diff` that the job's file-selection step no
      longer references `ui.ts`.
- [x] 2.2 Rewrite `check.yml`'s `#251` comment block (the "src/i18n/ui.ts
      stays carved out" section) to describe this change's resolution
      instead of the permanent exclusion, referencing this change.
- [x] 2.3 Update `stryker.config.mjs`'s own comment describing the `#251`
      exclusion to match, so the two files' documentation stays
      consistent.

## 3. Verify in real CI

- [x] 3.1 Push a PR that touches `src/i18n/ui.ts` (or includes a trivial,
      reviewable change to it) and verify the mutation job runs against
      the file and completes within its job timeout with a 100% score,
      on a real GitHub Actions run - not just locally.
- [x] 3.2 Confirm `test/ui.test.ts` and `e2e/i18n.spec.ts` still pass
      unmodified, verifying no behavior or test-coverage regression from
      this change.
