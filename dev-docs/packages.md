# Package relationships

Washy washy started as one monorepo,
[`alrayyes/washy-washy`](https://github.com/alrayyes/washy-washy), with the
web app living under its `apps/web`. This repo is that app split out on its
own so it can version and deploy independently of the CLI — same reasoning
that pulled the shared logic out into its own packages rather than leaving
two apps with their own copies of chart parsing and PDF rendering.

Four repos make up the ecosystem today:

- **[`washy-washy-web`](https://github.com/alrayyes/washy-washy-web)** —
  this repo. The web app: renders a chart as a filterable page, with an
  in-browser editor for both the chart and the machine it's checked against.
- **[`washy-washy-cli`](https://github.com/alrayyes/washy-washy-cli)** — the
  command-line counterpart. Same chart and machine file format, rendered as
  a PDF instead of a web page.
- **[`washy-washy-sdk`](https://github.com/alrayyes/washy-washy-sdk)**,
  published as `@washy-washy/core` (pinned at `1.3.0` here — see
  `package.json`) — chart and machine parsing, validation, and the domain
  logic neither app should have its own copy of: resolving a chart against a
  machine, deciding what can and can't share a wash (`canMix`/`mixBlocker`),
  formatting values for display. Both apps depend on it; neither reimplements
  it.
- **[`washy-washy-pdf`](https://github.com/alrayyes/washy-washy-pdf)**,
  published as `@washy-washy/pdf` (pinned at `2.3.5` here) — the actual PDF
  rendering, built on `@react-pdf/renderer` and `pdf-lib`. `renderPhone` and
  `renderPrint` are the two layouts the CLI has always produced; `renderCard`
  is a purpose-built single-pile layout this app uses for one card's own
  download button, added specifically, so this app didn't need to fake it by
  slicing `renderPhone`'s output (see #77).

The dependency direction is one-way: this repo and `washy-washy-cli` both
depend on `@washy-washy/core` and `@washy-washy/pdf`; neither of those
packages knows either app exists. A change to the chart/machine format or to
how a PDF renders happens in the shared package first, gets published, then
gets picked up here as an exact-pinned version bump — never patched locally
against a vendored copy.

## Why `@react-pdf/renderer` is overridden to 4.9.0

`package.json` pins `@react-pdf/renderer` to `4.9.0` in `overrides`, whatever
`@washy-washy/pdf` itself declares. This is the one place the "never patched
locally" rule above bends, and it's deliberate.

`@washy-washy/pdf` 2.4.3 pinned `@react-pdf/renderer` to `4.7.0`, to force the
`@react-pdf/pdfkit` fork over raw `pdfkit`. `washy-washy-cli` needs that,
because raw `pdfkit` breaks inside a flattened `bun build --compile`
executable ([washy-washy-pdf#109](https://github.com/alrayyes/washy-washy-pdf/issues/109)).
The fork's browser build needs an explicit `registerStdFonts(...)` call that
nothing in `@react-pdf/renderer` makes, so any bundle that resolves the
`browser` export condition dies on first render with
`Standard font "Helvetica" is not registered`.

This repo ships a static bundle for real browsers and never a compiled
executable, so it can use the raw-`pdfkit` line. `4.9.0` depends on
`pdfkit@0.20.1` and works under `bun test --conditions=browser` and in
Chromium.

When Dependabot proposes anything above `4.9.0`, check first that it still
depends on raw `pdfkit`:

```sh
npm view @react-pdf/renderer@<version> dependencies
```

If the override is ever removed, `bun test --conditions=browser
test/webmcp.test.ts` is the regression guard for this bug. Issue #283 stays
open until then.

## Sharing translations with washy-washy-pdf

Whenever a new locale lands here — a new dictionary in `src/i18n/ui.ts` plus
a new `data/washy-washy.<locale>.json.dist` — pass the new
`washy-washy.<locale>.json.dist` to `washy-washy-pdf`'s own session so it can
run its overflow/rendering checks against real translated strings instead of
only synthetic long-text fixtures. Non-Latin scripts and unusually long
compound words (Arabic, Chinese, German, Turkish's dotted/dotless İ/I) each
stress the PDF renderer's font and layout handling in ways an ASCII
placeholder can't, and this repo's own layout bugs from real translations
(#151) have already turned out to generalise.

- `ListAgents` first — `washy-washy-pdf` runs its own long-running session on
  its own repo; this isn't something to branch into directly (see the
  `washy-washy-repo-layout` memory).
- Hand over the new locale's `.json.dist` and say what prompted it; let that
  session decide whether and how to extend its own test suite
  (`overflow-guards.test.ts` today) — this repo doesn't own
  `washy-washy-pdf`'s tests or its ticket queue.
