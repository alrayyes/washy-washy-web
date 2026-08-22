---
title: Generate a config with an AI chat tool
description: A copy-pasteable prompt for turning photos of your washer and iron, plus a description of your laundry, into a config file this app can load.
---

This page is documentation only — the web app does no image handling and
makes no AI calls itself. You paste this prompt and your own photos into
whatever AI chat tool you already use, and upload what comes back through
the header's "Upload config" button, the same as any other config file.

## Get the exact format

Open [`/config`](https://washy-washy.ryankes.eu/config/) and use its
**Download** link. That downloads the config currently active in your
browser — the bundled example, unless you've already uploaded or edited one
— as the exact `{ machine, chart }` JSON shape the app expects. Attach that
file to your chat alongside your photos, rather than describing the shape
from memory: it's the same file the app validates your answer against
([`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)'s
`parseConfig`), so there's no format to get subtly wrong.

## Photograph your appliances

- Your washing machine's fascia — the dial and every option button.
- Your iron's thermostat ring or dial.

## The prompt

```text
Attached is a photo of my washing machine's fascia, a photo of my iron's
thermostat, and an example washy-washy config file. Write me the same
"machine" shape for my own appliances, then a "chart" array for the laundry
I describe below, and return the whole thing as one JSON object shaped
exactly like the attached example: { "machine": {...}, "chart": [...] }.

For the machine:
- Copy every label exactly as printed, in whatever language it's in. Do not
  translate anything into English and do not tidy up spelling or
  punctuation — a chart that doesn't match the machine is worse than no
  chart.
- washer.programs is the dial, listed in the order the positions go round
  it, starting at the off position and going clockwise. This order changes
  every other programme's angle in the drawing, so read it off the photo
  rather than grouping the programmes sensibly.
- iron.settings is the thermostat ring, coolest first.

For the chart, one entry per pile of laundry:
- Every machine-facing value has to come out of the machine you just wrote:
  program from washer.programs, temperature from washer.temperatures, spin
  from washer.spins, options from washer.options, iron_setting from
  iron.settings' keys. Spell them exactly as they appear there.
- ironing is "yes" or "no". When it's "no", leave iron_setting empty.
- duration is roughly how long that programme runs on my machine, as
  "~H:MM".

My laundry: <describe it — fabrics, colours, what you own a lot of, what
you line dry, anything with a care label you actually follow>.
```

## Check it, then upload it

Two things are worth checking by hand before you trust the result.

Nothing in a photo says which dial position is off, so the model has to
guess — get it wrong and every drawing in the chart is rotated. Start at the
off position and count clockwise yourself against the photo.

A model states a wash temperature with total confidence and is sometimes
wrong. Check anything that would ruin a garment — wool, silk, anything with
elastane — against the actual care label before you trust the chart.

Then upload the JSON through the header's "Upload config" button. That runs
it through the same `parseConfig` the download came from: a typo in a
programme name or a missing field fails there, naming the specific field, so
an invented value never reaches the page you'd stand in front of the machine
reading.
