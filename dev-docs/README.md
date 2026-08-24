# Contributor docs

This is the technical counterpart to [`/docs`](https://washy-washy.ryankes.eu/docs/)
— where that site covers using the web app, this covers building it: how the
pieces fit together, how this repo relates to its siblings in the washy-washy
ecosystem, and the patterns you'll run into reading the code.

Plain repo markdown, not part of the deployed site — `/docs` is translated
into five languages (#144) and this isn't, so it stays out of the same
webpage rather than being the one untranslated corner of it. For toolchain
versions, build/test/lint commands, hooks and the release process, see
[`CONTRIBUTING.md`](../CONTRIBUTING.md) — that stays the first stop for
actually getting a checkout running. This is where the "why" that doesn't
fit in a `CONTRIBUTING.md` bullet lives instead.

- **[Architecture](architecture.md)** — the static-site shape and where
  React islands sit inside it.
- **[Package relationships](packages.md)** — how this repo relates to
  `washy-washy-cli` and the shared `@washy-washy/core`/`@washy-washy/pdf`
  packages.
- **[Island hydration](hydration.md)** — the `data-hydrated` convention
  every React island and every Playwright test relies on, and the race it
  exists to avoid.
