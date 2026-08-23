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

![The config page: read-only machine summary, upload/download controls, and every pile as an editable card](/docs/media/config-chart-cards.png)

## Theme toggle

The header also has a light/dark toggle, next to "Upload config" on every
page. Left alone, the site follows your OS or browser's
`prefers-color-scheme` setting, same as before this existed. Clicking it sets
an explicit choice instead, stored in `localStorage`, which then overrides
that OS setting on every page and every future visit — until you click it
again. It's a two-state toggle, not a picker: there's no separate "back to
system" option.

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
saved from a previous visit — see Share below for the button that hands that
URL off.

![The Advanced filters open, with washing-only selected](/docs/media/sheet-filters.png)

## Share

Next to the "Download this sheet as a PDF" button sits **Share this
view**, which sends the current page URL as-is — filters and all, since the
address bar already carries them as query parameters (see Filters above), so
there's nothing extra to package up. It tries the browser's native share
sheet first (`navigator.share` — Messages, WhatsApp, AirDrop, whatever the OS
offers), falling back to copying the URL to the clipboard — showing
"Copied!" the same way a card's own Copy link button does — only when that
API isn't available, or when it's available but genuinely fails. Cancelling
the share sheet is neither: it's just declining that one method, so nothing
else happens and nothing gets copied behind your back.

## PDF export

The front page's "Download this sheet as a PDF" button renders the same
phone PDF the CLI's `bun run generate` writes, using the same
[`@washy-washy/pdf`](https://github.com/alrayyes/washy-washy-pdf) the CLI
does — but client-side, and only for whatever's currently filtered onto the
page. A single card also has its own **Download** button, for one pile at
a time rather than the whole chart. Neither one generates anything until
you click it; filtering the page never triggers a render in the background.

![A single card's own Download and Copy link buttons](/docs/media/sheet-pdf-download.png)

**Copy link**, next to a card's download button, puts that filtered view's
URL on your clipboard — the same clipboard fallback the page-level Share
button above uses, scoped to one card.
