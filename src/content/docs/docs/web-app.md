---
title: Using the web app
description: The filters on the front page, what persists between visits, and how uploading a config relates to the bundled example.
---

The web app is live at [washy-washy.ryankes.eu](https://washy-washy.ryankes.eu).
It reads the same [chart and machine files](/docs/chart-and-machine/) the CLI
does, rendered as a page instead of a PDF.

## Bundled vs. active config

The front page (`/`) ships with a made-up example chart and machine — the
same dummy data the CLI's own README shows. That's what a first-time visitor
sees, and it's what every page falls back to when nothing else is active.

Uploading a config replaces it. The "Upload config" button in the header —
present on every page — and the fuller upload/download section on
[`/config`](https://washy-washy.ryankes.eu/config/) both take the same
`{ machine, chart }` JSON file (see
[the chart and machine files](/docs/chart-and-machine/)), validate it, and
store it in the browser's `localStorage`. From then on, every page reads
that config instead of the bundled one, until you clear it.

Editing on `/config` or [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
works the same way: a save writes the edited config to the same storage.
Nothing here is sent to a server — a config never leaves your browser, and a
different browser or a cleared site data starts back at the bundled example.

`/config` also has a download link, which writes the currently active config
— bundled or custom — back out as the same JSON shape you'd upload. That's
the round trip for editing a copy elsewhere, or handing your config to
someone else.

## Filters

The front page filters by which cut you want (full chart, washing only,
ironing only) and by a free-text pile search, plus an "Advanced" disclosure
— closed by default — for filtering by an exact programme, temperature or
spin, and a detergent search. All of them narrow the same list; a pile has
to match every active filter to show.

Filters persist in `localStorage` between visits, the same way a config
does. A filtered view is also shareable: the address bar carries `cut`,
`pile`, `program`, `temperature`, `spin` and `detergent` as query
parameters, and a URL carrying any of them wins outright over whatever was
saved from a previous visit — copying the link is the whole sharing
mechanism, no separate "share" button needed.
