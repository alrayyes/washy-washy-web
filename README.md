[![check](https://github.com/alrayyes/washy-washy-web/actions/workflows/check.yml/badge.svg)](https://github.com/alrayyes/washy-washy-web/actions/workflows/check.yml)
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

- [Bun](https://bun.sh/) 1.4.0
- A Cloudflare account with access to this app's Workers project
  (`washy-washy-web`), for anyone deploying rather than just running it
  locally — deploys happen automatically via Cloudflare's GitHub
  integration on every push to `main`, and on every pull request as a
  preview

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[GPL-3.0-or-later](LICENSE)
