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

Claude Code sessions in this repo get Svelte's own [MCP server](https://svelte.dev/docs/ai/overview) (`.mcp.json`, `AGENTS.md`) — Svelte/SvelteKit documentation lookup and static analysis for any Svelte component work.

## Architecture

Static Astro site (`output: "static"`), deployed to Cloudflare Workers as
static assets with no Worker script and no server-side code
(`wrangler.jsonc`) — everything client-side, including the active chart,
machine config and every filter, lives in the visitor's own `localStorage`
and never reaches a server.

- The sheet viewer, config editor and machine editor are Svelte islands
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
- Cache and compression headers come from Cloudflare, so a file server can't
  test them. `public/_headers` sets `no-cache` for everything and a year-long
  `immutable` lifetime for `/_astro/*`. `e2e/delivery.spec.ts` and the
  Lighthouse run use `wrangler dev` (ports 4322 and 4321), which applies that
  file and compresses the way the edge does. `astro.config.mjs` puts the
  stylesheet (about 7 KB compressed) inside each page, so it never blocks first
  paint.
- `@washy-washy/pdf` is dynamically imported only when a download button is
  clicked (`SheetViewer.svelte`'s `handleDownload`/`handleDownloadCard`), never
  on page load or a filter change — filtering never triggers a render nobody
  asked for.

## Building and testing

```sh
bun run build       # astro build, static output to dist/
bun run check        # astro check, type-checks .astro files
bun run typecheck    # tsc --noEmit, everything else
bun run test          # bun:test, unit tests under test/
bun run test:e2e     # Playwright, against a real astro build
bun run lighthouse   # Category scores plus cache, latency and render-blocking insights, see lighthouserc.cjs
bun run docs:media   # Regenerate the /docs page screenshots; commit the result by hand
```

## Linting and hooks

```sh
bun run lint         # biome check .
bun run lint:fix     # biome check --write .
bun run lint:md       # prettier --check + markdownlint-cli2
bun run lint:yaml     # prettier --check
bun run lint:prose    # vale, error-level only (bun run prose:sync first)
scripts/lint-ltex.sh  # LTeX grammar and spelling, needs Docker (or ltex-cli-plus on PATH)
```

[Lefthook](https://github.com/evilmartians/lefthook) runs the fast checks on
`pre-commit` and `commit-msg`, and the full check/typecheck/lint set on
`pre-push` — the same commands CI runs, so the two can't drift. That includes
LTeX, which `pre-push` runs through the same script as CI, so pushing needs
Docker. Hooks print nothing on success and the full linter output on failure
(`output: [failure]`).

`pre-push` runs its jobs in parallel, so a busy machine slows the unit tests.
Tests that render a PDF or mount a component set a one-minute timeout with
`setDefaultTimeout` instead of Bun's five-second default. Give a new slow test one
rather than skipping the hook.

The Vale pre-commit job only reads the staged Markdown and never touches the
network. The pinned binary in `.tools/` and the style packages come from
`bun run prose:sync`; the first `pre-push` runs it for you if you haven't, so
run it yourself before your first commit that touches Markdown, and again to
refresh the packages.

```sh
bun run prepare       # lefthook install, run automatically after bun install
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), linted by
`@commitlint/config-conventional` on every commit message and every pull
request's full range.

## Branching, review and release

Work lands through a pull request — no direct pushes to `main`. One
logical change per commit and per PR. `main` is protected: a PR needs these
checks green before it can merge.

- `check`, `mutation` and `e2e`, from `.github/workflows/check.yml`
- `commits`, `ltex`, `dependency-review` and `semgrep`, from the same file
- `pr-title`, from `.github/workflows/pr-title.yml`

`lighthouse` and `vale` (the advisory prose run) also run on every PR but
aren't required.

Versioning is automatic: [semantic-release](https://semantic-release.gitbook.io/)
reads the Conventional Commits on `main` and cuts a version, changelog and
GitHub release — nobody picks a version by hand. Cloudflare's own GitHub
integration handles the actual deploy on every push to `main`, and posts a
preview URL on every pull request.
