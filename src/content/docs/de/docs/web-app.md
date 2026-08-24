---
title: Die Web-App nutzen
description: Die Filter auf der Startseite, was zwischen Besuchen erhalten bleibt, und wie ein hochgeladenes Konfigurationsfile sich zum mitgelieferten Beispiel verhält.
---

Die Web-App läuft live unter
[washy-washy.ryankes.eu](https://washy-washy.ryankes.eu). Sie liest
dieselben [Wäsche- und Maschinendateien](/de/docs/chart-and-machine/) wie das
CLI, gerendert als Seite statt als PDF.

## Mitgelieferte vs. aktive Konfiguration

Die Startseite (`/`) wird mit einer erfundenen Beispiel-Wäschetabelle und
-Maschine ausgeliefert — denselben Dummy-Daten, die auch das README des
CLI zeigt. Das sieht ein Erstbesucher, und darauf fällt jede Seite zurück,
wenn nichts anderes aktiv ist.

Eine hochgeladene Konfiguration ersetzt sie. Der Button „Upload config" in
der Kopfzeile — auf jeder Seite vorhanden — und der ausführlichere
Upload/Download-Bereich auf
[`/config`](https://washy-washy.ryankes.eu/config/) nehmen beide dieselbe
`{ machine, chart }`-JSON-Datei entgegen (siehe
[die Wäsche- und Maschinendateien](/de/docs/chart-and-machine/)), validieren
sie und speichern sie im `localStorage` des Browsers. Von da an liest jede
Seite diese Konfiguration statt der mitgelieferten, bis du sie löschst.

Das Bearbeiten auf `/config` oder
[`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
funktioniert genauso: Ein Speichern schreibt die bearbeitete Konfiguration
in denselben Speicher. Dabei wird nichts an einen Server gesendet — eine
Konfiguration verlässt nie deinen Browser, und ein anderer Browser oder
gelöschte Website-Daten starten wieder beim mitgelieferten Beispiel.

`/config` hat außerdem einen Download-Link, der die aktuell aktive
Konfiguration — mitgeliefert oder eigene — wieder in derselben JSON-Form
ausgibt, die du hochladen würdest. Das ist der Rundweg, um anderswo eine
Kopie zu bearbeiten oder deine Konfiguration an jemand anderen
weiterzugeben.

<img class="theme-shot" data-variant="light" src="/docs/media/de/config-chart-cards-light.png" alt="Die Konfigurationsseite: schreibgeschützte Maschinenübersicht, Upload/Download-Steuerelemente und jeder Stapel als bearbeitbare Karte" />
<img class="theme-shot" data-variant="dark" src="/docs/media/de/config-chart-cards-dark.png" alt="Die Konfigurationsseite: schreibgeschützte Maschinenübersicht, Upload/Download-Steuerelemente und jeder Stapel als bearbeitbare Karte" />

## Theme-Umschalter

Die Kopfzeile hat außerdem einen Hell/Dunkel-Umschalter, neben „Upload
config" auf jeder Seite. Unangetastet folgt die Seite der
`prefers-color-scheme`-Einstellung deines Betriebssystems oder Browsers,
genau wie bevor es diesen Umschalter gab. Ein Klick darauf setzt
stattdessen eine explizite Wahl, gespeichert in `localStorage`, die diese
Betriebssystem-Einstellung dann auf jeder Seite und bei jedem zukünftigen
Besuch überschreibt — bis du erneut klickst. Es ist ein
Zwei-Zustands-Umschalter, kein Auswahlmenü: Es gibt keine eigene Option
„zurück zu System".

## Tastaturnavigation

Die Seite reagiert außerdem auf eine Handvoll Vim-artiger Tastenkürzel, die
einmal in der Kopfzeile eingebunden sind, sodass sie auf jeder Seite
funktionieren — auch in dieser Dokumentation:

- `j` und `k` scrollen die Seite nach unten und oben.
- `g` `g` (zweimal `g` drücken) springt nach oben.
- `G` (Umschalt-g) springt nach unten.
- `/` setzt den Fokus auf das eigene Suchfeld der Seite — zum Beispiel die
  Stapelsuche auf der Startseite — ohne dabei einen Schrägstrich
  hineinzuschreiben.
- `?` (Umschalt-?) öffnet ein Hilfe-Overlay, das all das auflistet; `Esc`
  oder ein Klick daneben schließt es wieder.

Dasselbe Overlay lässt sich auch über den `?`-Button in der Kopfzeile
öffnen, für alle, die eine Maus oder einen Screenreader statt der Tastatur
nutzen. Keines dieser Kürzel löst aus, während du in ein Textfeld, eine
Textarea, ein Auswahlfeld oder etwas anderes Bearbeitbares tippst —
normales Tippen hat immer Vorrang.

## Filter

Die Startseite filtert danach, welche Ansicht du willst (vollständige
Tabelle, nur Waschen, nur Bügeln) und über eine Freitext-Stapelsuche, dazu
ein „Advanced"-Aufklappbereich — standardmäßig geschlossen — zum Filtern
nach genauem Programm, genauer Temperatur oder Schleuderzahl sowie einer
Waschmittelsuche. Alle schränken dieselbe Liste ein; ein Stapel muss jedem
aktiven Filter entsprechen, um angezeigt zu werden.

Die Auswahlfelder für Programm, Temperatur und Schleuderzahl bieten immer
nur Werte an, bei denen angesichts der Stapelsuche und allem, was du in
Advanced bereits ausgewählt hast, noch mindestens ein Stapel übrig bleibt —
so kannst du keine Kombination wählen, die dich auf einer leeren Tabelle
landen lässt. Die Listen aktualisieren sich live, während du andere Filter
änderst, und wenn für ein Feld nichts Passendes mehr übrig ist,
deaktiviert es sich selbst, statt leere Optionen anzuzeigen.

Filter bleiben zwischen Besuchen in `localStorage` erhalten, genau wie eine
Konfiguration. Eine gefilterte Ansicht ist auch teilbar: Die Adressleiste
führt `cut`, `pile`, `program`, `temperature`, `spin` und `detergent` als
Query-Parameter mit, und eine URL, die einen davon enthält, gewinnt
uneingeschränkt gegenüber allem, was von einem früheren Besuch gespeichert
war — siehe „Teilen" weiter unten für den Button, der diese URL weitergibt.

<img class="theme-shot" data-variant="light" src="/docs/media/de/sheet-filters-light.png" alt="Die geöffneten Advanced-Filter mit ausgewählter Option 'nur Waschen'" />
<img class="theme-shot" data-variant="dark" src="/docs/media/de/sheet-filters-dark.png" alt="Die geöffneten Advanced-Filter mit ausgewählter Option 'nur Waschen'" />

## Teilen

Neben den PDF-Download-Buttons sitzt **Share this
view**, der die aktuelle Seiten-URL unverändert versendet — Filter
inklusive, da die Adressleiste sie bereits als Query-Parameter mitführt
(siehe Filter oben), sodass nichts Zusätzliches zusammengepackt werden
muss.

Wenn du eine eigene Maschine oder Wäschetabelle aktiv hast (siehe
[Mitgelieferte vs. aktive Konfiguration](#mitgelieferte-vs-aktive-konfiguration)),
führt der Link auch dieses gesamte Setup mit, angehängt als komprimiertes
`#config=`-Fragment. Wer ihn öffnet, bekommt genau deine Maschine und
Tabelle, nicht nur deine Filter — sogar in einem Browser, der dein
`localStorage` nie berührt hat. Auch hier wird nichts an einen Server
übertragen: Ein Fragment wird nie über das Netzwerk gesendet, sodass der
Link selbst weiterhin die gesamte Übertragung ist, genau wie eine
hochgeladene Konfigurationsdatei. Sobald die Seite es gelesen und
gespeichert hat, entfernt sie das Fragment aus der Adressleiste — lädst du
neu oder teilst von dort erneut, bekommst du die normale kurze URL der
Seite, nicht den Einmal-Link. Ein Link, der beschädigt oder von Hand
bearbeitet wurde, zeigt denselben auf Zeile und Spalte bezogenen Fehler wie
ein ungültiger Konfigurations-Upload, und die Seite fällt auf das zurück,
was bereits aktiv war, statt kaputtzugehen. Ist nichts Eigenes aktiv,
bleibt der Link wie zuvor — nur Filter.

Zuerst versucht es das native Share-Sheet des Browsers (`navigator.share`
— Nachrichten, WhatsApp, AirDrop, was auch immer das Betriebssystem
bietet), und fällt nur dann auf das Kopieren der URL in die Zwischenablage
zurück — mit derselben Anzeige „Copied!" wie beim eigenen Copy-link-Button
einer Karte —, wenn diese API nicht verfügbar ist oder verfügbar ist, aber
tatsächlich fehlschlägt. Das Abbrechen des Share-Sheets ist keins von
beidem: Es lehnt nur diese eine Methode ab, sodass nichts weiter passiert
und nichts heimlich kopiert wird.

## PDF-Export

Die Startseite hat zwei Download-Buttons, beide begrenzt auf das, was
aktuell auf der Seite gefiltert ist, und clientseitig gerendert mit
demselben [`@washy-washy/pdf`](https://github.com/alrayyes/washy-washy-pdf),
das auch `bun run generate` des CLI verwendet. Keiner der beiden erzeugt
irgendetwas, bevor du ihn anklickst — das Filtern der Seite löst nie im
Hintergrund ein Rendering aus.

- **Download for phone** schreibt dieselbe schmale, einzelne scrollbare
  Seite wie das CLI — gedacht zum Ablesen auf dem Handy neben der
  Maschine.
- **Download to print** schreibt stattdessen ein A4-Blatt: eine
  Referenztabelle plus eine Detailkarte pro Stapel, gedacht zum Ausdrucken
  und Aufhängen.

Auch eine einzelne Karte hat ihren eigenen **Download**-Button, für
jeweils einen Stapel. Das gibt es nur im Handy-Format — das Druck-Layout
zeichnet immer die gesamte Referenztabelle plus die Karte jedes Stapels,
sodass es sich nicht wie beim Handy-Format auf nur einen Stapel eingrenzen
lässt.

<img class="theme-shot" data-variant="light" src="/docs/media/de/sheet-pdf-download-light.png" alt="Die eigenen Download- und Copy-link-Buttons einer einzelnen Karte" />
<img class="theme-shot" data-variant="dark" src="/docs/media/de/sheet-pdf-download-dark.png" alt="Die eigenen Download- und Copy-link-Buttons einer einzelnen Karte" />

**Copy link**, neben dem Download-Button einer Karte, legt die URL dieser
gefilterten Ansicht in deine Zwischenablage — derselbe
Zwischenablage-Fallback, den auch der Share-Button der Seite oben nutzt,
nur begrenzt auf eine Karte.
