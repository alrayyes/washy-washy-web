---
title: Washy washy docs
description: Chart your own laundry, and use the web app's filters, uploads and AI-generated configs.
---

Washy washy turns a laundry chart into something you can actually read
standing in front of the machine: a phone-friendly page, filterable by cut
and by pile. A separate [CLI](https://github.com/alrayyes/washy-washy-cli)
reads the same chart and machine description and renders it as a PDF instead
— this site covers the web app only; the CLI has its own README for
installing and running it.

![The front page: a laundry chart with cut and pile filters, and a button to download the whole sheet as a PDF](/docs/media/sheet-overview.png)

Start with whichever matches what you're trying to do:

- **[The chart and machine files](/docs/chart-and-machine/)** — every field
  in your chart, how the machine file describes your washer and iron, and how
  the mixing rules decide what can share a drum.
- **[Using the web app](/docs/web-app/)** — the filters on the front page,
  what persists between visits, and how uploading a config here relates to
  the bundled example.
- **[Generate a config with an AI chat tool](/docs/ai-prompt/)** — paste a
  copy-pasteable prompt and photos of your washer and iron, and get back a
  config file this app can load.
