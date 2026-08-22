# washy-washy-web

The Astro web app for washy-washy, split out of
[`washy-washy`](https://github.com/alrayyes/washy-washy)'s `apps/web`
into its own repo so it can version and deploy independently of the CLI.

This repo is a placeholder while the split lands — see
[#1](https://github.com/alrayyes/washy-washy-web/issues/1) for the porting
work in progress. The sections below describe the target shape; they'll
fill in for real once the app itself is ported.

## Requirements

- [Bun](https://bun.sh/) (version pinned once the app lands, matching
  `washy-washy`'s toolchain)
- A Cloudflare account with access to this app's Pages/Workers project, for
  anyone deploying rather than just running it locally

## Installation

```sh
bun install
```

## Usage

```sh
bun run dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[GPL-3.0-or-later](LICENSE)
