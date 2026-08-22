# Contributing

## Toolchain

- [Bun](https://bun.sh/) 1.4.0, [TypeScript](https://www.typescriptlang.org/) 6.0.3 (pinned separately from `washy-washy`'s own TypeScript — see `astro check`'s own version needs).

```sh
bun install
```

## Building and testing

```sh
bun run build       # astro build, static output to dist/
bun run check        # astro check, type-checks .astro files
bun run typecheck    # tsc --noEmit, everything else
bun run test:e2e     # Playwright, against a real astro build
bun run lighthouse   # Category-score gates, see lighthouserc.cjs
```

## Linting and hooks

```sh
bun run lint         # biome check .
bun run lint:fix     # biome check --write .
bun run lint:md       # prettier --check + markdownlint-cli2
bun run lint:yaml     # prettier --check
```

[Lefthook](https://github.com/evilmartians/lefthook) runs the fast checks on
`pre-commit` and `commit-msg`, and the full check/typecheck/lint set on
`pre-push` — the same commands CI runs, so the two can't drift.

```sh
bun run prepare       # lefthook install, run automatically after bun install
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), linted by
`@commitlint/config-conventional` on every commit message and every pull
request's full range.

## Branching, review and release

Work lands through a pull request — no direct pushes to `main`. One
logical change per commit and per PR. `main` is protected: PRs require the
`check` workflow to pass.

Versioning is automatic: [semantic-release](https://semantic-release.gitbook.io/)
reads the Conventional Commits on `main` and cuts a version, changelog and
GitHub release — nobody picks a version by hand. Cloudflare's own GitHub
integration handles the actual deploy on every push to `main`, and posts a
preview URL on every pull request.
