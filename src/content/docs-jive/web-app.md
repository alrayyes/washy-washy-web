---
title: Rappin' the Web Jive
description: The siftin' and sortin' goin' down on the front page, what sticks around when ya split and come back, and how tossin' up your own jive squares with the jive that's already boxed in.
---

This here web jive is live and kickin' at [washy-washy.ryankes.eu](https://washy-washy.ryankes.eu).
It's readin' off the same [chart and machine jive](/jive/docs/chart-and-machine/) the CLI's
readin', only it's laid out as a page 'stead of gettin' pressed into a PDF.

## The Boxed-In Jive vs. the Jumpin' Jive

The front page (`/`) come correct with a made-up chart and machine outta thin air — the
same bogus jive the CLI's own README done showed ya. That's the first thing a fresh cat
layin' eyes on it gonna see, and it's what every page falls back on when ain't nothin'
else jumpin'.

Tossin' up your own jive knocks that boxed-in one clean out the box. The "Upload config"
button ridin' up top in the header — kickin' it on every single page — and the fatter
upload/download spread over on [`/config`](https://washy-washy.ryankes.eu/config/) both
scarf down the same `{ machine, chart }` JSON file (dig
[the chart and machine jive](/jive/docs/chart-and-machine/)), check it's on the up-and-up,
and stash it away in the browser's `localStorage`. From there on, every page reads off
that jive 'stead of the boxed-in one — until ya wipe it clean.

Fixin' things up on `/config` or [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
jives the same way: hit save and it lays the fixed-up jive down in that same stash. Ain't
nothin' here gettin' shipped off to no server — your jive never once steps outside your
browser, and a different browser or wiped-clean site data drops ya right back at the
boxed-in jive.

`/config`'s also packin' a download link, and that one lays whatever jive's jumpin' right
now — boxed-in or your own — back out as that same JSON shape you'd be uploadin'. That's
your round trip for fixin' up a copy someplace else, or slidin' your jive to some other cat.

<img class="theme-shot" data-variant="light" src="/docs/media/jive/config-chart-cards-light.png" alt="The config page, Jack: a look-don't-touch machine rundown, upload/download switches, and every pile struttin' as its own fixable card" />
<img class="theme-shot" data-variant="dark" src="/docs/media/jive/config-chart-cards-dark.png" alt="The config page, Jack: a look-don't-touch machine rundown, upload/download switches, and every pile struttin' as its own fixable card" />

## The Light 'n Dark Switch

The header's also packin' a light/dark switch, sittin' right next to "Upload config" on
every page, no jive. Leave it be and the site just follows whatever your OS or browser's
`prefers-color-scheme` setting's already sayin' — same deal as before this switch ever
showed up. Give it a click and you're layin' down your own say-so instead, stashed in
`localStorage`, and that overrides the OS setting on every page and every visit from
here on — till ya click it again. It's a two-way flip, dig, not no fancy picker: ain't no
separate "back to system" jive to fall back on.

## Keyboard Struttin'

The site's also hip to a handful of vim-style shortcuts, wired up once in the header so
they're workin' on every last page — these here jive-docs included:

- `j` and `k` scoot the page on down and back up.
- `g` `g` (hit `g` twice, quick) jumps ya clean up to the top.
- `G` (that's shift-g) jumps ya down to the bottom, no jive.
- `/` zeroes right in on the page's own search box — the pile search on the front page,
  dig — without droppin' no slash in there.
- `?` (shift-?) pops open a help overlay listin' the whole rundown; `Esc` or a click
  outside it shuts it right back down.

That same overlay also pops open from the `?` button up in the header, for any cat
workin' a mouse or a screen reader 'stead of the keyboard. None of these shortcuts go off
while you're typin' into a text field, a textarea, a select, or anything else you can
scribble in — regular typin' always wins out, no jive.

## Siftin' and Sortin'

The front page sifts things down by which cut you're after (the whole chart, washin'
only, ironin' only) and by a free-text pile search, plus an "Advanced" flap — shut by
default, no jive — for narrowin' down to an exact programme, temperature or spin, plus a
detergent search. Every last one of 'em's workin' the same list, Jack; a pile's gotta
square up with every filter that's jumpin' before it shows its face.

Them programme, temperature and spin picks only ever lay out values that'd still leave
at least one pile standin', countin' the pile search and whatever else you already
locked down in Advanced — so ya can't cook up no combination that dumps ya on a flat-out
empty chart. The lists get hip and update live soon as ya touch another filter, and if a
field ain't got nothin' left that could match up, it shuts itself clean off 'stead of
showin' ya empty air.

Filters stick around in `localStorage` between visits, same jive as a config does. A
filtered look is also somethin' ya can pass along: the address bar's totin' `cut`,
`pile`, `program`, `temperature`, `spin` and `detergent` as query parameters, and any URL
packin' one of them wins straight-out over whatever got saved from the last time through
— check Sharin' the Jive down below for the button that hands that URL off.

<img class="theme-shot" data-variant="light" src="/docs/media/jive/sheet-filters-light.png" alt="The Advanced flap thrown wide open, washin'-only picked out" />
<img class="theme-shot" data-variant="dark" src="/docs/media/jive/sheet-filters-dark.png" alt="The Advanced flap thrown wide open, washin'-only picked out" />

## Sharin' the Jive

Right alongside them PDF download buttons sits **Share this
view**, and that one ships the current page URL just as it stands — filters, the whole
shebang — since the address bar's already totin' 'em as query parameters (peep Siftin'
and Sortin' up above), so ain't nothin' extra needin' packed up.

If you got yourself a custom machine or chart jumpin' (peep
[The Boxed-In Jive vs. the Jumpin' Jive](#the-boxed-in-jive-vs-the-jumpin-jive)), that
link's totin' the whole setup too, tacked on as a squeezed-down `#config=` tail. Whoever
cracks it open gets your exact machine and chart, not just your filters — even on a
browser that ain't never once laid a finger on your `localStorage`. Ain't nothin' here
touchin' no server neither: a fragment don't never go out over the wire, so the link
itself's still the whole transfer, same as an uploaded config file woulda been. Soon as
the page's read it and stashed it away, it wipes that fragment clean off the address bar
— reload or share again from there and you get the site's regular short URL, not that
one-shot link. A link that's been busted up or hand-monkeyed-with throws up the same
row/column-scoped error a bum config upload would, and the page just falls back to
whatever was already jumpin' 'stead of bustin' apart. When ain't nothin' custom in play,
the link's the same as it always was — filters only, no jive.

It tries the browser's own native share sheet first (`navigator.share` — Messages,
WhatsApp, AirDrop, whatever the OS is servin' up), and only falls back on copyin' the URL
to the clipboard — flashin' "Copied!" same as a card's own Copy link button does — when
that API just ain't there, or it's there but genuinely flops. Cancellin' the share sheet
ain't neither one of them things: it's just you passin' on that one method, so nothin'
else happens and nothin' gets snuck onto your clipboard behind your back.

## Pressin' Out the PDF

The front page's packin' two download buttons, both of 'em scoped down to whatever's
filtered onto the page right then, and both gettin' rendered client-side with that same
[`@washy-washy/pdf`](https://github.com/alrayyes/washy-washy-pdf) jive the CLI's
`bun run generate` runs on. Neither one's cookin' up a thing till ya click it — filterin'
the page never once sets off no render back in the shadows.

- **Download for phone** lays down that same narrow, one-long-scroll page the CLI cooks
  up — built for readin' right off your phone standin' next to the machine.
- **Download to print** lays down an A4 sheet instead: a reference table plus one detail
  card per pile, built to get printed out and stuck up on the wall.

A single card's also packin' its own **Download** button, for one pile at a time, solo.
It's phone format only, dig — the print layout always draws up the whole reference table
plus every pile's card, so ain't no way to scope it down to just the one pile the way the
phone format can.

<img class="theme-shot" data-variant="light" src="/docs/media/jive/sheet-pdf-download-light.png" alt="A single card's own Download and Copy link buttons, right there for the takin'" />
<img class="theme-shot" data-variant="dark" src="/docs/media/jive/sheet-pdf-download-dark.png" alt="A single card's own Download and Copy link buttons, right there for the takin'" />

**Copy link**, sittin' right next to a card's download button, lays that filtered view's
URL down on your clipboard — same clipboard fallback the page-level Share button up
above uses, just scoped down to the one card.
