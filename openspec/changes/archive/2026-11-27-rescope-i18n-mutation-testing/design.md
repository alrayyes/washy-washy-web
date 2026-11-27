# Design

## Context

See proposal.md - Why for the full evidence trail. The concrete shape in
`src/i18n/ui.ts` (2973 lines): 11 top-level `const <locale>: Ui = {...}`
object literals (`en`, `ja`, `es`, `de`, `fr`, `ar`, `zh`, `tr`, `jive`,
`linkedin`, `ru`, lines 287-2933) hold the actual translated strings, an
`export const dictionaries: Record<Locale, Ui> = {...}` (2946-2958) just
maps locale names to those objects with no string literals of its own,
and `translator()` (2963+) is the only real logic in the file. Stryker's
default `StringLiteral` mutator generates one mutant per string in every
one of those 11 objects; `test/ui.test.ts` never asserts an individual
translated value, only structural properties (key parity, non-emptiness)
that happen to catch the one mutation Stryker applies to a string
(replace with `""`).

This repo already has an established, narrower alternative to file-level
`mutate` exclusion: inline `// Stryker disable <MutatorName>` /
`// Stryker restore <MutatorName>` comment pairs, already used in
`src/lib/storage.ts`, `src/lib/filter.ts`, `src/i18n/locales.ts`, and
elsewhere to suppress a specific mutator across a specific region while
leaving the rest of the file mutated normally.

## Goals / Non-Goals

**Goals:**

- Stop generating `StringLiteral` mutants against the 11 locale objects'
  values, without disabling any other mutator Stryker would otherwise
  apply to `ui.ts` (for example against `translator()`'s own logic).
- Bring `src/i18n/ui.ts` back into CI's per-PR mutation job scope.
- Keep the change confined to mutation-testing configuration and its
  documentation; no test or application logic changes.

**Non-Goals:**

- Changing how translations are authored, validated, or type-checked.
- Broadening or narrowing what `test/ui.test.ts` or `e2e/i18n.spec.ts`
  assert - they already cover what mutation testing was never actually
  adding value on top of.
- Revisiting the `.tsx`/`.astro` DOM-touching exclusion or any other
  exclusion documented in `stryker.config.mjs` - out of scope here.

## Decisions

**Use inline `// Stryker disable StringLiteral` / `// Stryker restore
StringLiteral` around each of the 11 locale object literals, not a
`mutate` glob change or a separate `ignore` config.**

Alternatives considered:

- _Split `ui.ts` into a logic module and 11 per-locale data modules,
  excluding the data modules from `mutate` entirely._ Rejected: a bigger,
  unrelated refactor of the file's structure to solve a mutation-testing
  config problem, and this repo's own `#219` precedent (documented in
  `stryker.config.mjs`) already treats file-glob exclusion as the tool for
  DOM-touching files, not for carving out part of an otherwise-fine file.
- _A dedicated Stryker `ignore` block matching a line-range pattern in
  `stryker.config.mjs`._ Stryker has no such cross-file line-range config;
  its documented mechanism for "mutate this file but not this region" is
  exactly the inline comment pair already in use here.
- _Leave `ui.ts` fully excluded and only add a lighter, non-mutation check
  for `translator()`._ Rejected: `translator()`'s own logic (locale
  lookup, fallback, `{token}` interpolation) is exactly the kind of
  branching logic mutation testing is good at, and it is already covered
  by `test/ui.test.ts` - excluding it forgoes real coverage for no reason
  once the dictionaries stop dominating the mutant count.

The inline comments go around each locale's `const <locale>: Ui = {...}`
block individually (11 pairs) rather than one pair spanning from the
first to the last, so a future locale added between two existing ones
only needs its own pair, not a re-check of where the spanning region
starts and ends.

**Revert the `check.yml` mutation job's `:(exclude)src/i18n/ui.ts`
pathspec and rewrite the `#251` comment block to describe this
resolution**, rather than leaving the exclusion in place alongside the
narrower `mutate` scoping. The exclusion's entire justification was
`ui.ts`'s mutant count relative to every other file the job covers; once
that count drops to roughly `translator()`'s own branch count (in the
same range as this repo's other mutated files, per the proposal's
Impact section), the justification no longer holds and leaving the
pathspec in place would silently re-introduce the debt this change
resolves.

## Risks / Trade-offs

- **A future edit to the file moves code in or out of the disabled
  region without updating the comment pair, silently re-widening or
  narrowing what's excluded.** Mitigation: each pair is scoped tightly to
  one `const <locale>: Ui = {...}` block, the same discipline already
  applied to the single-line pairs elsewhere in this repo; a review
  catches a mismatched pair the same way it would any other misplaced
  Stryker comment.
- **`translator()`'s own mutant count in CI turns out to still be
  sensitive to the same runner-class overhead `#251` found, just at a
  smaller scale.** Mitigation: verify with a real CI run (not just local)
  before removing the `check.yml` exclusion, per tasks.md - if it
  reproduces, that's new information for a follow-up, not something to
  guess about here.

## Migration Plan

1. Add the 11 inline disable/restore pairs to `src/i18n/ui.ts`.
2. Run `bun run mutation` locally scoped to `src/i18n/ui.ts` and confirm
   the mutant count drops to roughly `translator()`'s own logic and the
   score is still 100%.
3. Remove the `:(exclude)src/i18n/ui.ts` pathspec from `check.yml`'s
   mutation job and rewrite its `#251` comment block.
4. Update `stryker.config.mjs`'s own comment describing the `#251`
   exclusion to match.
5. Open a PR touching `src/i18n/ui.ts` (or push a no-op change to it) to
   get a real CI run of the mutation job against the file before merging,
   confirming the fix holds under the actual runner class `#251` found
   the problem on - not just locally.

No rollback complexity: reverting is re-adding the pathspec and the
comment pairs, both trivial diffs, if CI verification in step 5 doesn't
hold.
