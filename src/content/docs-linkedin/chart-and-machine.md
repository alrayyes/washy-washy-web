---
title: The Roadmap and Org Chart, a Deep Dive
description: Every field on your roadmap, how the org chart describes your washer and iron, and how the compatibility matrix decides what can co-locate in one drum.
---

Excited to unpack this: one JSON object describes the whole org. Your
washer and iron under `machine`, and one entry per deliverable under
`chart`. Both the CLI and the platform's upload accept exactly this shape
— it's what
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)'s
`parseConfig` validates. No exceptions, no special asks.

```json
{
  "machine": { "washer": { "..." }, "iron": { "..." } },
  "chart": [{ "clothing_type": "..." }]
}
```

## The roadmap

Each entry under `chart` is one deliverable:

| Field             | What goes in it                                                      |
| ----------------- | -------------------------------------------------------------------- |
| `clothing_type`   | What you call the deliverable — this is the card's personal brand    |
| `detergent`       | Which solution and how much                                          |
| `fabric_softener` | `yes` or `no`                                                        |
| `temperature`     | A temp check your machine offers                                     |
| `spin`            | A spin your machine offers                                           |
| `duration`        | Roughly the sprint length, as `~H:MM`                                |
| `program`         | A strategy, spelled exactly as on the fascia                         |
| `options`         | Growth levers, pipe-separated; empty for none                        |
| `ironing`         | `yes` or `no` — whether it gets aligned at all                       |
| `ironing_notes`   | Prose: the alignment plan, or why there isn't one. Often empty       |
| `iron_setting`    | A thermostat position. Empty when `ironing` is `no`                  |
| `drying`          | Prose: the post-wash ops plan                                        |
| `colour_group`    | `white`, `colour`, `dark`, `sport` or `any`                          |
| `mix_tags`        | Pipe-separated: `lint-shedder`, `lint-magnet`, `dye-bleeder`, `solo` |
| `notes`           | Anything else worth a shoutout                                       |

Every machine-facing value — `program`, `temperature`, `spin`, `options`,
`iron_setting` — is validated against what your own `machine` offers, so a
typo fails with the specific row and column rather than shipping a card
that tells you to align the dial somewhere it doesn't go. Radical
transparency, baked in.

## The org chart

`machine.washer` lists the dial's labels in physical order, plus the temp
checks, spins and growth levers the display offers. `machine.iron` lists
the thermostat's positions, from coolest to hottest — think of it as the
org's own leveling ladder. Copy every label exactly as printed in front of
you, in whatever language that is — nothing here ever translates a fascia
label, because a chart you have to translate back while standing at the
machine is a worse deliverable than no chart.

The order of `washer.programs` is load-bearing — this isn't a metaphor,
it's the literal mechanism: the first entry is the off position, drawn at
twelve o'clock, and every other tick's angle comes from where it sits in
the list. Leaving one out doesn't just remove it — it re-orgs every tick
after it.

The platform's own
[`/config/machine`](https://washy-washy.ryankes.eu/config/machine/) editor
writes this same shape — reordering the strategy list there does exactly
what reordering the JSON array would. No surprises, no scope creep:

<img class="theme-shot" data-variant="light" src="/docs/media/linkedin/machine-editor-light.png" alt="The machine editor's spin speeds, buttons and iron settings table" />
<img class="theme-shot" data-variant="dark" src="/docs/media/linkedin/machine-editor-dark.png" alt="The machine editor's spin speeds, buttons and iron settings table" />

```json
{
  "washer": {
    "name": "Generic front loader",
    "capacity": "1–8 kg",
    "programs": ["Off", "Cottons", "Delicates / Silk", "Wool"],
    "temperatures": ["cold", "20", "30", "40", "60", "90"],
    "spins": ["0", "400", "600", "800", "1200", "1400"],
    "options": ["Speed", "Eco", "Easy Iron", "Extra Rinse"]
  },
  "iron": {
    "name": "Generic steam iron",
    "settings": [
      {
        "key": "min",
        "dots": "",
        "label": "MIN",
        "detail": "no heat",
        "steam": false
      },
      {
        "key": "3",
        "dots": "•••",
        "label": "•••",
        "detail": "cotton, linen · 200 °C",
        "steam": true
      }
    ]
  }
}
```

## What can co-locate in the wash

Two deliverables may share a drum only when all of these hold, checked in
order — the first one that fails is the reason a compatibility matrix
would show, no politics involved:

1. Neither is tagged `solo` — no lone wolves in this sprint.
2. If either is a `lint-shedder`, the other must be too — alignment goes
   both ways.
3. Their `colour_group` matches (`any` matches everything — a true
   culture add).
4. `program`, `temperature`, `spin` and the set of `options` are
   identical.

Deliverables merge onto one card, sharing a single dial drawing, when
everything you physically set agrees: strategy, temperature, spin,
options, whether the culture-add softener goes in, and where the iron's
thermostat points. Prose fields (`detergent`, `drying`, `notes`) are
deliberately not part of that check — two deliverables can want different
solutions and still share a card, and the card lists both lines against
the deliverable they belong to. Everyone wins.
