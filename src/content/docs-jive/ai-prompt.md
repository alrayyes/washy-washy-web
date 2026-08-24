---
title: Jive up a config wit' an AI rap tool
description: A copy-an'-paste rap for turnin' snapshots o' yo' washer an' iron, plus the 411 on yo' laundry, into a config file this jive can chew on.
---

This here page be strictly rap, Jack — the web jive don't be handlin' no
pictures an' don't be callin' up no AI its own self. You be pastin' this rap
an' yo' own snapshots into whatever AI rap tool you already be rappin' wit',
an' upload whatever come back through the header's "Upload config" button,
just like any other config jive.

## Get yo'self the exact format, Jack

Cut on over to [`/config`](https://washy-washy.ryankes.eu/config/) an' work
that **Download** link. That there pulls down the config that's cookin' in
yo' browser right now — the example that come bundled in, less'n you already
jived one up or futzed wit' one — shaped up exact as the `{ machine, chart }`
JSON the app be lookin' for. Staple that file onto yo' chat 'longside yo'
snapshots, 'stead o' tryin' to rap the shape from memory: it's the same file
the app be checkin' yo' answer against
([`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)'s
`parseConfig`), so ain't no way the format be gettin' subtly jacked up.

## Snap some pictures o' yo' gear

- Yo' washin' machine's face — the dial an' every last option button.
- Yo' iron's thermostat ring or dial.

## The rap

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

## Check it out, then upload that jive

Two things worth checkin' by hand 'fore you go trustin' the result.

Ain't nothin' in a snapshot sayin' which dial spot is off, so the model
gotta guess — get it wrong an' every drawin' in the chart be spun clean
'round. Start at the off spot an' count clockwise yo'self, right there
against the picture.

A model gon' state a wash temperature like it's straight-up gospel, an'
sometimes it be jive talkin'. Check anything that'd tear up a garment —
wool, silk, anything wit' elastane in it — against the real care label
'fore you go trustin' the chart.

Then upload that JSON through the header's "Upload config" button. That
runs it right through the same `parseConfig` the download came outta: a
typo in a programme name or a field gone missin' fails right there, callin'
out the exact field, so ain't no made-up value ever gonna reach the page
you standin' in front o' the machine readin'.
