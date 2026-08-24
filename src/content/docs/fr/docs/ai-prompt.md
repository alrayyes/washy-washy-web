---
title: Générer une configuration avec un outil de chat IA
description: Un prompt prêt à l'emploi pour transformer des photos de ton lave-linge et de ton fer, plus une description de ton linge, en un fichier de configuration que cette application peut charger.
---

Cette page est uniquement de la documentation — l'application web ne fait
aucun traitement d'image et n'effectue elle-même aucun appel IA. Tu colles
ce prompt et tes propres photos dans l'outil de chat IA que tu utilises
déjà, et tu importes ce qui en ressort via le bouton « Importer une
configuration » de l'en-tête, comme n'importe quel autre fichier de
configuration.

## Obtenir le format exact

Ouvre [`/config`](https://washy-washy.ryankes.eu/config/) et utilise son
lien **Télécharger**. Ça télécharge la configuration actuellement active
dans ton navigateur — l'exemple fourni par défaut, à moins que tu n'en aies
déjà importé ou modifié une — sous la forme JSON exacte `{ machine, chart }`
que l'application attend. Joins ce fichier à ta conversation avec tes
photos, plutôt que de décrire la forme de mémoire : c'est le même fichier
que l'application utilise pour valider ta réponse (`parseConfig` de
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)), donc
il n'y a pas de format à te tromper subtilement.

## Photographier tes appareils

- La façade de ton lave-linge — le sélecteur et chaque bouton d'options.
- L'anneau ou le cadran du thermostat de ton fer.

## Le prompt

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

## Vérifier, puis importer

Deux choses valent la peine d'être vérifiées à la main avant de faire
confiance au résultat.

Rien dans une photo n'indique quelle position du sélecteur est la position
arrêt, donc le modèle doit deviner — s'il se trompe, tous les dessins de la
grille sont décalés. Repère toi-même la position arrêt et compte dans le
sens des aiguilles d'une montre en te fiant à la photo.

Un modèle annonce une température de lavage avec une confiance totale et se
trompe parfois. Vérifie tout ce qui pourrait abîmer un vêtement — laine,
soie, tout ce qui contient de l'élasthanne — par rapport à la véritable
étiquette d'entretien avant de faire confiance à la grille.

Importe ensuite le JSON via le bouton « Importer une configuration » de
l'en-tête. Ça le fait passer par le même `parseConfig` que celui d'où vient
le téléchargement : une faute de frappe dans un nom de programme ou un champ
manquant échoue à cet endroit, en nommant le champ précis, pour qu'une
valeur inventée n'atteigne jamais la page que tu lirais debout devant la
machine.
