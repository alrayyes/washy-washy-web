---
title: Contributor docs
description: Architecture, package relationships and other technical documentation for working on this repo.
---

This is the technical counterpart to [`/docs`](/docs/) — where that site
covers using the web app, this one covers building it: how the pieces fit
together, how this repo relates to its siblings in the washy-washy
ecosystem, and the patterns you'll run into reading the code.

For toolchain versions, build/test/lint commands, hooks and the release
process, see [`CONTRIBUTING.md`](https://github.com/alrayyes/washy-washy-web/blob/main/CONTRIBUTING.md)
in the repo itself — that stays the first stop for actually getting a
checkout running. This site is where the "why" that doesn't fit in a
`CONTRIBUTING.md` bullet lives instead.

- **[Architecture](/dev-docs/architecture/)** — the static-site shape, where
  React islands sit inside it, and how the two Starlight surfaces (this one
  and the end-user `/docs`) coexist in one Astro project.
- **[Package relationships](/dev-docs/packages/)** — how this repo relates to
  `washy-washy-cli` and the shared `@washy-washy/core`/`@washy-washy/pdf`
  packages.
- **[Island hydration](/dev-docs/hydration/)** — the `data-hydrated`
  convention every React island and every Playwright test relies on, and the
  race it exists to avoid.
