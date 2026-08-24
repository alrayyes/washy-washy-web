---
title: Die Wäsche- und Maschinendateien
description: Jedes Feld deiner Wäschetabelle, wie die Maschinendatei deine Waschmaschine und dein Bügeleisen beschreibt, und wie die Mischregeln entscheiden, was sich eine Trommel teilen darf.
---

Ein einziges JSON-Objekt beschreibt alles: deine Waschmaschine und dein
Bügeleisen unter `machine`, und einen Eintrag pro Wäschestapel unter
`chart`. Sowohl das CLI als auch der Upload der Web-App akzeptieren genau
diese Form — es ist das, was `parseConfig` aus
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)
validiert.

```json
{
  "machine": { "washer": { "..." }, "iron": { "..." } },
  "chart": [{ "clothing_type": "..." }]
}
```

## Die Wäschetabelle

Jeder Eintrag unter `chart` ist ein Stapel:

| Feld              | Was hineingehört                                                          |
| ----------------- | ------------------------------------------------------------------------- |
| `clothing_type`   | Wie du den Stapel nennst — das ist die Überschrift der Karte              |
| `detergent`       | Welches Waschmittel und wie viel                                          |
| `fabric_softener` | `yes` oder `no`                                                           |
| `temperature`     | Eine Temperatur, die deine Maschine anbietet                              |
| `spin`            | Eine Schleuderzahl, die deine Maschine anbietet                           |
| `duration`        | Ungefähr wie lange es läuft, als `~H:MM`                                  |
| `program`         | Eine Reglerposition, genau so geschrieben wie auf der Blende              |
| `options`         | Optionstasten, durch Pipe getrennt; leer, wenn keine                      |
| `ironing`         | `yes` oder `no` — ob du es überhaupt bügelst                              |
| `ironing_notes`   | Fließtext: wie du es bügelst, oder warum du es nicht tust. Oft leer       |
| `iron_setting`    | Eine Thermostatposition. Leer, wenn `ironing` `no` ist                    |
| `drying`          | Fließtext: wie du es trocknest                                            |
| `colour_group`    | `white`, `colour`, `dark`, `sport` oder `any`                             |
| `mix_tags`        | Durch Pipe getrennt: `lint-shedder`, `lint-magnet`, `dye-bleeder`, `solo` |
| `notes`           | Alles andere, was wissenswert ist                                         |

Jeder maschinenbezogene Wert — `program`, `temperature`, `spin`, `options`,
`iron_setting` — wird gegen das geprüft, was deine eigene `machine` bietet,
sodass ein Tippfehler mit genauer Angabe von Zeile und Spalte fehlschlägt,
statt eine Karte zu erzeugen, die dich anweist, den Regler auf eine
Position zu drehen, die es gar nicht gibt.

## Die Maschine

`machine.washer` listet die Beschriftungen des Reglers in physischer
Reihenfolge auf, dazu die Temperaturen, Schleuderzahlen und Optionstasten,
die das Display bietet. `machine.iron` listet die Positionen des
Thermostats auf, von kühlster bis heißester. Übernimm jede Beschriftung
exakt so, wie sie vor dir aufgedruckt ist, in welcher Sprache auch immer —
hier wird niemals eine Blendenbeschriftung übersetzt, denn eine Tabelle,
die du vor der Maschine stehend erst zurückübersetzen musst, ist schlimmer
als gar keine Tabelle.

Die Reihenfolge von `washer.programs` ist tragend: Der erste Eintrag ist
die Aus-Position, auf zwölf Uhr gezeichnet, und der Winkel jeder anderen
Markierung ergibt sich aus ihrer Position in der Liste. Einen Eintrag
wegzulassen entfernt ihn nicht nur — es verschiebt jede Markierung danach.

Der [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)-Editor
der Web-App selbst schreibt genau diese Form — die Programmliste dort
umzusortieren bewirkt genau dasselbe wie das Umsortieren des JSON-Arrays:

<img class="theme-shot" data-variant="light" src="/docs/media/de/machine-editor-light.png" alt="Die Tabelle mit Schleuderzahlen, Tasten und Bügeleinstellungen des Maschinen-Editors" />
<img class="theme-shot" data-variant="dark" src="/docs/media/de/machine-editor-dark.png" alt="Die Tabelle mit Schleuderzahlen, Tasten und Bügeleinstellungen des Maschinen-Editors" />

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

## Was zusammen gewaschen werden darf

Zwei Stapel dürfen sich nur dann eine Trommel teilen, wenn all das
zutrifft, geprüft in dieser Reihenfolge — der erste Punkt, der nicht
zutrifft, ist der Grund, den eine Kompatibilitätsmatrix anzeigen würde:

1. Keiner der beiden ist mit `solo` markiert.
2. Wenn einer ein `lint-shedder` ist, muss es der andere auch sein.
3. Ihre `colour_group` stimmt überein (`any` passt zu allem).
4. `program`, `temperature`, `spin` und die Menge der `options` sind
   identisch.

Stapel verschmelzen zu einer Karte mit einer gemeinsamen Reglerzeichnung,
wenn alles übereinstimmt, was du physisch einstellst: Programm, Temperatur,
Schleuderzahl, Optionen, ob Weichspüler dazukommt, und wohin das Thermostat
des Bügeleisens zeigt. Fließtextfelder (`detergent`, `drying`, `notes`)
sind bewusst nicht Teil dieser Prüfung — zwei Stapel können
unterschiedliches Waschmittel wollen und sich trotzdem eine Karte teilen,
wobei die Karte beide Zeilen dem jeweiligen Stapel zuordnet.
