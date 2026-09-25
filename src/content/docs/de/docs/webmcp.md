---
title: WebMCP-Tools für Agenten
description: Die fünf Tools, die diese Seite für einen WebMCP-fähigen Browser oder eine Erweiterung registriert, damit ein Agent deine Wäschetabelle und Maschine direkt lesen, prüfen und bearbeiten kann.
---

[WebMCP](https://webmachinelearning.github.io/webmcp/) ist eine
experimentelle Browser-API — ein Entwurf der W3C Web Machine Learning
Community Group, den noch kein Browser standardmäßig unterstützt —, die es
einer Seite erlaubt, Tools zu deklarieren, die ein KI-Agent direkt in
deinem eigenen Browser-Tab, gegen deine eigenen Daten, aufrufen kann. Es
ist die automatisierte Version von [einer Konfiguration mit einem
KI-Chat-Tool erstellen](/de/docs/ai-prompt/): Statt dass du eine
heruntergeladene Konfiguration einfügst und das Ergebnis wieder
zurückkopierst, liest und schreibt ein Agent, der WebMCP versteht, direkt
die in deinem Browser aktive Konfiguration — validiert auf demselben Weg
wie in jedem der beiden Fälle.

Für alle ohne einen solchen Browser oder eine solche Erweiterung ändert
sich nichts: `document.modelContext` existiert einfach nicht, und die fünf
Tools dieser Seite werden nie registriert. Auch so wird nirgendwohin eine
Konfiguration gesendet: Ein Tool-Aufruf liest und schreibt dieselbe, in
`localStorage` gespeicherte Konfiguration, die jede andere Seite hier
bereits verwendet.

## Die fünf Tools

| Tool                   | Macht                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `washy_get_config`     | Liest die aktive Wäschetabelle und Maschine — deine eigene oder das mitgelieferte Beispiel.                                                                                        |
| `washy_validate_chart` | Prüft Tabellenzeilen gegen die aktive Maschine, ohne etwas zu speichern.                                                                                                           |
| `washy_set_chart`      | Ersetzt die aktive Wäschetabelle, zuerst validiert — dasselbe wie Speichern auf [`/config`](https://washy-washy.ryankes.eu/config/).                                               |
| `washy_set_machine`    | Ersetzt Waschmaschine und Bügeleisen, validiert die aktuelle Tabelle dagegen neu — dasselbe wie Speichern auf [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/). |
| `washy_export_pdf`     | Rendert die aktive Tabelle als PDF (Handy- oder Druck-Layout), zurückgegeben als Daten statt heruntergeladen.                                                                      |

Jedes davon läuft durch dieselbe
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)-Validierung,
die auch die Editoren auf der Seite nutzen — eine Zeile, die ein Agent
schreibt und die nicht zu deiner Maschine passt, schlägt mit demselben
Zeilen-und-Spalten-Fehler fehl, den auch der Wäschetabellen-Editor zeigen
würde, nicht mit einer stillen Vermutung.

## Gespeicherte Änderungen laden die Seite neu

`washy_set_chart` und `washy_set_machine` laden die Seite neu, sobald sie
gespeichert haben, genau wie es das Hochladen einer Konfiguration über die
Kopfzeile bereits tut — es gibt keine Live-Synchronisation zwischen einem
offenen Editor und einem Tool-Aufruf, ein Neuladen ist also der Weg, wie
er aufholt.

## Selbst ausprobieren

Installiere eine WebMCP-fähige Browser-Erweiterung oder öffne die
Entwicklerkonsole deines Browsers auf dieser Seite und rufe `await
document.modelContext.getTools()` auf — sobald native Unterstützung oder
ein Polyfill vorhanden ist, listet das alle fünf Tools mit Name und
Beschreibung auf, bevor du eines davon aufrufst.
