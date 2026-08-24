---
title: Les fichiers de grille et de machine
description: Chaque champ de ta grille, comment le fichier machine décrit ton lave-linge et ton fer à repasser, et comment les règles de mélange décident ce qui peut partager un tambour.
---

Un seul objet JSON décrit tout : ton lave-linge et ton fer sous `machine`, et
une entrée par tas de linge sous `chart`. Le CLI comme l'import de
l'application web acceptent exactement cette forme — c'est ce que
`parseConfig` de [`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)
valide.

```json
{
  "machine": { "washer": { "..." }, "iron": { "..." } },
  "chart": [{ "clothing_type": "..." }]
}
```

## La grille

Chaque entrée sous `chart` est un tas :

| Champ             | Ce qu'il contient                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `clothing_type`   | Comment tu appelles le tas — c'est le titre de la carte                                  |
| `detergent`       | Quel détergent et en quelle quantité                                                     |
| `fabric_softener` | `yes` ou `no`                                                                            |
| `temperature`     | Une température que ta machine propose                                                   |
| `spin`            | Une vitesse d'essorage que ta machine propose                                            |
| `duration`        | À peu près combien de temps ça tourne, au format `~H:MM`                                 |
| `program`         | Une position du sélecteur, orthographiée exactement comme sur la façade                  |
| `options`         | Boutons d'options, séparés par des barres verticales ; vide si aucune                    |
| `ironing`         | `yes` ou `no` — si tu repasses ce tas ou non                                             |
| `ironing_notes`   | Texte libre : comment le repasser, ou pourquoi tu ne le fais pas. Souvent vide           |
| `iron_setting`    | Une position du thermostat. Vide quand `ironing` vaut `no`                               |
| `drying`          | Texte libre : comment le faire sécher                                                    |
| `colour_group`    | `white`, `colour`, `dark`, `sport` ou `any`                                              |
| `mix_tags`        | Séparés par des barres verticales : `lint-shedder`, `lint-magnet`, `dye-bleeder`, `solo` |
| `notes`           | Tout ce qui vaut la peine d'être noté par ailleurs                                       |

Chaque valeur qui touche la machine — `program`, `temperature`, `spin`,
`options`, `iron_setting` — est vérifiée par rapport à ce que ton propre
`machine` propose vraiment, si bien qu'une faute de frappe échoue en
indiquant la ligne et la colonne précises, plutôt que de produire une carte
qui te dit de tourner le sélecteur sur une position qui n'existe pas.

## La machine

`machine.washer` liste les libellés du sélecteur dans leur ordre physique,
ainsi que les températures, vitesses d'essorage et boutons d'options que
propose l'afficheur. `machine.iron` liste les positions du thermostat, de la
plus froide à la plus chaude. Recopie chaque libellé exactement comme il est
imprimé devant toi, dans la langue où il est écrit — rien ici ne traduit
jamais un libellé de façade, parce qu'une grille qu'il faut retraduire en
étant planté devant la machine est pire que pas de grille du tout.

L'ordre de `washer.programs` compte : la première entrée est la position
arrêt, dessinée à midi, et l'angle de chaque autre position dépend de sa
place dans la liste. En oublier une ne se contente pas de la retirer — ça
déplace toutes les positions qui la suivent.

L'éditeur [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
de l'application web écrit exactement cette même forme — réordonner la liste
des programmes là-bas fait exactement ce que réordonner le tableau JSON
ferait :

<img class="theme-shot" data-variant="light" src="/docs/media/fr/machine-editor-light.png" alt="Le tableau des vitesses d'essorage, boutons et réglages du fer dans l'éditeur de machine" />
<img class="theme-shot" data-variant="dark" src="/docs/media/fr/machine-editor-dark.png" alt="Le tableau des vitesses d'essorage, boutons et réglages du fer dans l'éditeur de machine" />

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

## Ce qui peut se laver ensemble

Deux tas ne peuvent partager un tambour que si toutes ces conditions sont
réunies, vérifiées dans cet ordre — la première qui échoue est la raison
qu'une matrice de compatibilité afficherait :

1. Aucun des deux n'est marqué `solo`.
2. Si l'un des deux est un `lint-shedder`, l'autre doit l'être aussi.
3. Leur `colour_group` correspond (`any` correspond à tout).
4. `program`, `temperature`, `spin` et l'ensemble des `options` sont
   identiques.

Les tas fusionnent sur une seule carte, partageant un seul dessin de
sélecteur, quand tout ce que tu règles physiquement concorde : programme,
température, essorage, options, si l'assouplissant y va, et où pointe le
thermostat du fer. Les champs en texte libre (`detergent`, `drying`,
`notes`) sont volontairement exclus de cette vérification — deux tas peuvent
vouloir des détergents différents et quand même partager une carte, et la
carte liste les deux lignes en face du tas auquel elles appartiennent.
