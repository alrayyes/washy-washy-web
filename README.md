[![check](https://github.com/alrayyes/washy-washy-web/actions/workflows/check.yml/badge.svg)](https://github.com/alrayyes/washy-washy-web/actions/workflows/check.yml)
[![Codecov](https://codecov.io/gh/alrayyes/washy-washy-web/graph/badge.svg)](https://codecov.io/gh/alrayyes/washy-washy-web)
[![License: GPL-3.0-or-later](https://img.shields.io/badge/license-GPL--3.0--or--later-blue.svg)](LICENSE)

# washy-washy-web

The Astro web app for washy-washy: renders the same laundry chart the CLI
turns into a PDF as a filterable, shareable web page instead, with an
in-browser editor for both the chart and the machine it's checked against.

Split out of [`washy-washy`](https://github.com/alrayyes/washy-washy)'s
`apps/web` into its own repo so it can version and deploy independently of
the CLI. Uses [`@washy-washy/core`](https://github.com/alrayyes/washy-washy-sdk)
for chart/machine parsing and validation, and
[`@washy-washy/pdf`](https://github.com/alrayyes/washy-washy-pdf) for the
same PDF rendering the CLI uses, so a single card can be downloaded straight
from the page.

## Requirements

- [Bun](https://bun.sh/) 1.3.14
- A Cloudflare account with access to this app's Workers project
  (`washy-washy-web`), for anyone deploying rather than just running it
  locally — deploys happen automatically via Cloudflare's GitHub
  integration on every push to `main`, and on every pull request as a
  preview

See [`/docs`](https://washy-washy.ryankes.eu/docs/) for a proper docs site
covering this app — the chart and machine file formats, the web app's filters
and persisted state, and a prompt for generating a config from photos of your
appliances with an AI chat tool. [The CLI](https://github.com/alrayyes/washy-washy-cli)
has its own README for installing and running it.

Contributing to this repo? See [`dev-docs/`](dev-docs/) for architecture, how
this repo relates to `washy-washy-cli` and the shared `@washy-washy/*`
packages, and other technical documentation — start with
[`CONTRIBUTING.md`](CONTRIBUTING.md) to actually get a checkout running.

## Installation

```sh
bun install
```

## Usage

```sh
bun run dev
```

Serves the site at `http://localhost:4321`. The main page shows the bundled
example chart against the bundled example machine; both can be replaced
per-visitor by uploading a chart or editing settings on `/config`, stored in
the browser rather than on any server.

```sh
bun run build      # static build to dist/
bun run test:e2e   # Playwright, against a real astro build
```

## Languages

Every page — home, disclaimer, privacy, the washing loads and washer/iron
editors, and `/docs` — is available in:

- English (default)
- Japanese
- German
- Spanish
- French
- Arabic (right-to-left)
- Chinese (simplified)
- Turkish
- Jive — a joke locale, played for laughs

Pick one from the language switcher in the header. Every non-English page
shows a one-time banner warning that the translation is AI-generated and may
not be perfect.

## Configuration

Optional, both unset by default:

- `PUBLIC_UMAMI_SCRIPT_URL` and `PUBLIC_UMAMI_WEBSITE_ID` — enable
  [Umami](https://umami.is/) page-view analytics (self-hosted or Umami
  Cloud, either works — point `PUBLIC_UMAMI_SCRIPT_URL` at whichever
  instance's own `script.js`). Set both as Cloudflare Workers build
  environment variables to enable in production; leaving either unset
  disables tracking entirely, and the `/privacy` page's own text adjusts
  to match at build time either way.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[GPL-3.0-or-later](LICENSE)
