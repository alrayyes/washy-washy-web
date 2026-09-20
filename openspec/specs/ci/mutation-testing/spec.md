# ci/mutation-testing Specification

## Purpose

Defines what CI's mutation-testing gate is required to cover, and draws
the line between logic (in scope for mutation) and static data content
such as translated strings (out of scope, verified by direct assertions
instead).

## Requirements

### Requirement: Static translation content is excluded from mutation

Mutation testing SHALL NOT mutate the string values of a locale
dictionary (for example `src/i18n/ui.ts`'s per-locale `Ui` objects). Correctness
of translated content is verified by direct test assertions (key parity
across locales, non-empty values, rendered-output checks), not by
mutating and re-running the suite against each individual string.

#### Scenario: A locale dictionary's string values run mutation-free

- **WHEN** the mutation-testing job runs against a file containing a
  locale dictionary
- **THEN** no mutant is generated against any string literal inside that
  dictionary's object literal
- **AND** the file's non-dictionary logic (for example a lookup/interpolation
  function operating on the dictionary) is still mutated normally

#### Scenario: Translation correctness stays covered without mutation

- **WHEN** a locale dictionary is missing a key present in the English
  dictionary, or a value is empty
- **THEN** the test suite's key-parity and non-empty-value checks fail
  independently of mutation testing

### Requirement: CI's mutation job covers every file with in-scope logic

A source file SHALL NOT be permanently excluded from CI's mutation job
solely because it also contains a large amount of out-of-scope static
data. Once static data is excluded from mutation per the requirement
above, the file's remaining in-scope logic is mutated and gated the same
as any other file matching the job's `mutate` configuration.

#### Scenario: A file mixing logic and a large dictionary is mutated

- **WHEN** a changed file contains both mutation-testing logic and a
  large locale dictionary
- **THEN** CI's mutation job runs against that file's logic
- **AND** the job is not skipped or excluded for that file on account of
  the dictionary's size
