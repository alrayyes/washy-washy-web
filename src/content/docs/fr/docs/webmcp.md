---
title: Outils WebMCP pour les agents
description: Les cinq outils que ce site enregistre pour un navigateur ou une extension compatible WebMCP, afin qu'un agent puisse lire, valider et modifier directement votre grille et votre machine.
---

[WebMCP](https://webmachinelearning.github.io/webmcp/) est une API de
navigateur expérimentale — un brouillon du Web Machine Learning Community
Group du W3C, qu'aucun navigateur n'implémente encore par défaut — qui
permet à une page de déclarer des outils qu'un agent d'IA peut appeler
directement, dans votre propre onglet de navigateur, sur vos propres
données. C'est la version automatisée de [générer une configuration avec
un outil de chat IA](/fr/docs/ai-prompt/) : plutôt que de coller une
configuration téléchargée puis de recopier le résultat, un agent qui
comprend WebMCP lit et écrit directement la configuration déjà active dans
votre navigateur, validée de la même façon que les deux méthodes.

Rien ici ne change ce que fait l'application pour quiconque n'a pas un tel
navigateur ou une telle extension : `document.modelContext` n'existera
tout simplement pas, et les cinq outils de cette page ne sont jamais
enregistrés. Aucune configuration n'est envoyée où que ce soit dans les
deux cas : un appel d'outil lit et écrit la même configuration stockée
dans `localStorage` que toute autre page ici utilise déjà.

## Les cinq outils

| Outil                  | Fait                                                                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `washy_get_config`     | Lit la grille et la machine actives — la vôtre, ou l'exemple fourni.                                                                                                                     |
| `washy_validate_chart` | Vérifie les lignes de la grille par rapport à la machine active, sans rien enregistrer.                                                                                                  |
| `washy_set_chart`      | Remplace la grille active, validée d'abord — comme Enregistrer sur [`/config`](https://washy-washy.ryankes.eu/config/).                                                                  |
| `washy_set_machine`    | Remplace le lave-linge et le fer actifs, en revalidant la grille actuelle par rapport à eux — comme Enregistrer sur [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/). |
| `washy_export_pdf`     | Génère la grille active en PDF (mise en page téléphone ou impression), renvoyé sous forme de données plutôt que téléchargé.                                                              |

Chacun d'eux passe par la même validation
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core) que
les éditeurs de la page — une ligne qu'un agent écrit et qui ne correspond
pas à votre machine échoue avec la même erreur de ligne et de colonne que
l'éditeur de grille afficherait, pas avec une supposition silencieuse.

## Les modifications enregistrées rechargent la page

`washy_set_chart` et `washy_set_machine` rechargent la page une fois
l'enregistrement effectué, exactement comme le fait déjà le téléversement
d'une configuration depuis l'en-tête — il n'y a pas de synchronisation en
direct entre un éditeur ouvert et un appel d'outil, un rechargement est
donc la façon dont il se met à jour.

## Essayez par vous-même

Installez une extension de navigateur compatible WebMCP, ou ouvrez la
console des outils de développement de votre navigateur sur ce site et
appelez `await document.modelContext.getTools()` — dès qu'un support natif
ou un polyfill est présent, cela liste les cinq outils par nom et
description avant que vous n'en appeliez aucun.
