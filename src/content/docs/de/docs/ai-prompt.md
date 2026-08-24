---
title: Eine Konfiguration mit einem KI-Chat-Tool erstellen
description: Ein copy-paste-fertiger Prompt, der Fotos deiner Waschmaschine und deines Bügeleisens plus einer Beschreibung deiner Wäsche in eine Konfigurationsdatei verwandelt, die diese App laden kann.
---

Diese Seite ist reine Dokumentation — die Web-App verarbeitet selbst keine
Bilder und macht keine eigenen KI-Aufrufe. Du fügst diesen Prompt und
deine eigenen Fotos in ein beliebiges KI-Chat-Tool ein, das du bereits
nutzt, und lädst das Ergebnis über den Button „Upload config" in der
Kopfzeile hoch, genau wie jede andere Konfigurationsdatei.

## Das genaue Format bekommen

Öffne [`/config`](https://washy-washy.ryankes.eu/config/) und nutze dort
den **Download**-Link. Das lädt die aktuell in deinem Browser aktive
Konfiguration herunter — das mitgelieferte Beispiel, sofern du nicht schon
eine hochgeladen oder bearbeitet hast — in genau der `{ machine, chart }`-
JSON-Form, die die App erwartet. Häng diese Datei zusammen mit deinen
Fotos an deinen Chat an, statt die Form aus dem Gedächtnis zu beschreiben:
Es ist dieselbe Datei, gegen die die App deine Antwort validiert
(`parseConfig` aus
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)),
sodass es kein Format gibt, das sich unbemerkt verfälschen lässt.

## Fotografiere deine Geräte

- Die Blende deiner Waschmaschine — der Regler und jede Optionstaste.
- Der Thermostatring oder -regler deines Bügeleisens.

## Der Prompt

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

## Prüfen, dann hochladen

Zwei Dinge lohnt es sich, von Hand zu prüfen, bevor du dem Ergebnis
vertraust.

Nichts auf einem Foto verrät, welche Reglerposition „Aus" ist, also muss
das Modell raten — liegt es falsch, ist jede Zeichnung in der Tabelle
verdreht. Beginne selbst bei der Aus-Position und zähle im Uhrzeigersinn
anhand des Fotos nach.

Ein Modell nennt eine Waschtemperatur mit voller Überzeugung und liegt
manchmal trotzdem falsch. Prüfe alles, was ein Kleidungsstück ruinieren
würde — Wolle, Seide, alles mit Elasthan — gegen das tatsächliche
Pflegeetikett, bevor du der Tabelle vertraust.

Lade das JSON dann über den Button „Upload config" in der Kopfzeile hoch.
Das schickt es durch dasselbe `parseConfig`, aus dem auch der Download
stammte: Ein Tippfehler in einem Programmnamen oder ein fehlendes Feld
schlägt dort fehl, unter Nennung des konkreten Felds, sodass ein
erfundener Wert nie die Seite erreicht, die du vor der Maschine stehend
liest.
