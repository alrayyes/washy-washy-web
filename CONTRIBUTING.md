# Contributing

See [`dev-docs/`](dev-docs/) for a deeper look at the architecture and how
this repo relates to `washy-washy-cli` and the shared
`@washy-washy/core`/`@washy-washy/pdf` packages. What follows here is what
you need to actually get a checkout running.

## Toolchain

- [Bun](https://bun.sh/) 1.3.14, [TypeScript](https://www.typescriptlang.org/) 6.0.3 (pinned separately from `washy-washy`'s own TypeScript — see `astro check`'s own version needs).

```sh
bun install
```

## Architecture

Static Astro site (`output: "static"`), deployed to Cloudflare Workers as
static assets with no Worker script and no server-side code
(`wrangler.jsonc`) — everything client-side, including the active chart,
machine config and every filter, lives in the visitor's own `localStorage`
and never reaches a server.

- The sheet viewer, config editor and machine editor are React islands
  (`client:load`) inside otherwise-static Astro pages. Each sets
  `data-hydrated="true"` once its listeners are attached — the e2e suite
  waits on that flag rather than racing hydration, and any Playwright script
  driving the page (`scripts/capture-docs-media.ts` included) should do the
  same.
- `/docs` is [Starlight](https://starlight.astro.build/), mounted at a
  subpath alongside the app's own pages rather than owning the site root —
  its content lives one directory deeper than Starlight's own default
  (`src/content/docs/docs/`, not `src/content/docs/`) specifically so pages
  land under `/docs/...` (see `astro.config.mjs`).
- `scripts/serve-dist.ts` stands in for `astro preview`/`astro dev` in both
  the e2e suite and `scripts/capture-docs-media.ts`: both daemonize and exit
  immediately once up, which reads as a crash to anything expecting a
  foreground server. It's also the more honest test — a plain static file
  server is what Cloudflare actually serves.
- `@washy-washy/pdf` is dynamically imported only when a download button is
  clicked (`SheetViewer.tsx`'s `handleDownload`/`handleDownloadCard`), never
  on page load or a filter change — filtering never triggers a render nobody
  asked for.

## Building and testing

```sh
bun run build       # astro build, static output to dist/
bun run check        # astro check, type-checks .astro files
bun run typecheck    # tsc --noEmit, everything else
bun run test          # bun:test, unit tests under test/
bun run test:e2e     # Playwright, against a real astro build
bun run lighthouse   # Category-score gates, see lighthouserc.cjs
bun run docs:media   # Regenerate the /docs page screenshots; commit the result by hand
```

## Linting and hooks

```sh
bun run lint         # biome check .
bun run lint:fix     # biome check --write .
bun run lint:md       # prettier --check + markdownlint-cli2
bun run lint:yaml     # prettier --check
bun run lint:prose    # vale, error-level only (bun run prose:sync first)
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
