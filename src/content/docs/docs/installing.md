---
title: Install and run the CLI
description: Generate the phone and print PDFs from a chart, with or without installing anything but Docker.
---

The CLI ([alrayyes/washy-washy-cli](https://github.com/alrayyes/washy-washy-cli))
reads one config file — your appliances and your chart together — and writes
six PDFs: a phone-friendly sheet and an A4 reference sheet, each also cut into
a washing-only and an ironing-only version, because those two jobs happen in
different rooms hours apart and neither wants to read past the other's advice
to find its own.

This page covers enough to get PDFs out. For the full picture — the split
sheets, the compatibility matrix, where the bundled example's advice comes
from — read the [CLI's own README](https://github.com/alrayyes/washy-washy-cli#readme)
directly; nothing here replaces it.

## Requirements

[Bun](https://bun.sh) 1.3 or newer. Nothing else — no build step, no browser,
no network access at run time.

## Installing

```sh
git clone https://github.com/alrayyes/washy-washy-cli.git
cd washy-washy-cli
bun install --frozen-lockfile
```

## Generating PDFs

```sh
bun run generate
```

With no config file of your own, this reads the bundled example — a made-up
generic washer, generic iron, and sixteen made-up piles — and writes to
`out/`. It's useful for seeing the shape of the thing, useless for actually
doing your laundry. Point it at your own file once you have one (see
[the chart and machine files](/docs/chart-and-machine/)):

```sh
bun run generate my-laundry.json --out ~/Documents
```

## Without installing anything

Every release publishes a container image, so you can run it with nothing on
the machine but Docker:

```sh
docker run --rm \
  --cap-drop=ALL --security-opt=no-new-privileges --read-only \
  -v "$PWD/out:/out" \
  ghcr.io/alrayyes/washy-washy-cli
```

That uses the dummy config baked into the image. Mount your own over the top
to chart your own laundry:

```sh
docker run --rm \
  --cap-drop=ALL --security-opt=no-new-privileges --read-only \
  -v "$PWD/out:/out" \
  -v "$PWD/my-laundry.json:/app/data/washy-washy.json:ro" \
  ghcr.io/alrayyes/washy-washy-cli
```

The container runs as an unprivileged user, so the PDFs come out owned by
`1000:1000`. If that isn't your own ID, add `--user "$(id -u):$(id -g)"`.
