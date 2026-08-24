---
title: De Chart 'n Machine Jams, Solid!
description: Every jive in yo chart, how de machine jam lay down de word on yo washer 'n iron, and how de mixin' rules be decidin' what can get down in de same drum together, dig?
---

One solid JSON jam lay down de whole scene: yo washer and iron under
`machine`, and one entry for every stack o' dirty rags under `chart`. Both
de CLI and de web app's upload be diggin' exactly dis shape, Jack — dat's
what [`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)'s
`parseConfig` be checkin' out, solid.

```json
{
  "machine": { "washer": { "..." }, "iron": { "..." } },
  "chart": [{ "clothing_type": "..." }]
}
```

## De Chart, Solid

Each entry under `chart` be one stack o' rags, dig:

| Field             | What goes in it                                                                  |
| ----------------- | -------------------------------------------------------------------------------- |
| `clothing_type`   | Whatchu call dat stack, Jack — dis be de card's big ol' headline                 |
| `detergent`       | Which soap jam you throwin' in, and how much o' dat stuff                        |
| `fabric_softener` | `yes` or `no`                                                                    |
| `temperature`     | A heat setting yo machine done offer up                                          |
| `spin`            | A spin speed yo machine be throwin' down                                         |
| `duration`        | 'Bout how long dat thing be runnin', jive as `~H:MM`                             |
| `program`         | A dial spot, spelled just like it say right there on de fascia, no jivin' around |
| `options`         | Option buttons, pipe-separated; leave it empty if ain't none                     |
| `ironing`         | `yes` or `no` — whether you be ironin' dat thing at all                          |
| `ironing_notes`   | Talk: how you iron dat jam, or why you don't mess with it. Mostly empty          |
| `iron_setting`    | A thermostat spot. Empty when `ironing` be `no`                                  |
| `drying`          | Talk: how you dry dat thing out                                                  |
| `colour_group`    | `white`, `colour`, `dark`, `sport` or `any`                                      |
| `mix_tags`        | Pipe-separated, dig: `lint-shedder`, `lint-magnet`, `dye-bleeder`, `solo`        |
| `notes`           | Anything else worth knowin', solid                                               |

Every machine-facin' jive — `program`, `temperature`, `spin`, `options`,
`iron_setting` — get checked against what yo own `machine` be offerin', so
a typo gonna bust wit' de exact row 'n column 'stead o' cookin' up a card
dat tell you to crank de dial someplace it don't even go, Jack.

## De Machine, Jack

`machine.washer` be listin' de dial's labels in de order they really sit,
plus de heat settings, spin speeds and option buttons de display be
throwin' down. `machine.iron` be listin' de thermostat's spots, from
coolest all de way to scorchin'. Copy every label just like it's printed
right in front o' yo face, whatever language dat happen to be — ain't
nothin' here ever translatin' a fascia label, 'cause a chart you gotta
translate back while you standin' at de machine be worse than no chart at
all, dig?

De order o' `washer.programs` be totin' de whole weight: de first entry be
de off position, drawn up at twelve o'clock, and every other tick's angle
come straight from where it be sittin' in dat list. Leave one out and you
ain't just droppin' it — you movin' every tick dat come after, solid.

De web app's own
[`/config/machine`](https://washy-washy.ryankes.eu/config/machine/) editor
be writin' dis same shape — shufflin' de programme list up in there do
exactly what shufflin' de JSON array would, no jive:

<img class="theme-shot" data-variant="light" src="/docs/media/jive/machine-editor-light.png" alt="De machine editor's spin speeds, buttons 'n iron settings table, laid out solid" />
<img class="theme-shot" data-variant="dark" src="/docs/media/jive/machine-editor-dark.png" alt="De machine editor's spin speeds, buttons 'n iron settings table, laid out solid" />

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

## What Can Get Down Together in De Wash

Two stacks o' rags can only share a drum when all o' dis check out, in
order — de first one dat come up bust be de reason a compatibility matrix
woulda showed you, dig:

1. Neither one be tagged `solo`, Jack.
2. If either one be a `lint-shedder`, de other one gotta be too, no
   exceptions.
3. Their `colour_group` be matchin' up (`any` matches everything, solid).
4. `program`, `temperature`, `spin` and de whole set o' `options` be
   dead-on identical.

Stacks merge up onto one card, sharin' a single dial drawin', when
everything you physically set be agreein': programme, temperature, spin,
options, whether softener be goin' in, and where dat iron's thermostat be
pointin'. Talk fields (`detergent`, `drying`, `notes`) ain't part o' dat
check on purpose — two stacks can want different soap and still share one
card, and de card lay down both lines against de stack they belong to,
solid.
