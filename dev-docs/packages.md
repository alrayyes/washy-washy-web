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
