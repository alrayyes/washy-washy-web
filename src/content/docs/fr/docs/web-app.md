---
title: Utiliser l'application web
description: Les filtres sur la page d'accueil, ce qui persiste entre les visites, et le rapport entre importer une configuration et l'exemple fourni par défaut.
---

L'application web est en ligne sur [washy-washy.ryankes.eu](https://washy-washy.ryankes.eu).
Elle lit les mêmes [fichiers de grille et de machine](/fr/docs/chart-and-machine/)
que le CLI, rendus en page plutôt qu'en PDF.

## Configuration fournie par défaut vs. configuration active

La page d'accueil (`/`) est livrée avec une grille et une machine d'exemple
inventées — les mêmes données factices que montre le README du CLI. C'est ce
que voit quelqu'un qui visite le site pour la première fois, et c'est sur
quoi retombe chaque page quand rien d'autre n'est actif.

Importer une configuration la remplace. Le bouton « Importer une
configuration » dans l'en-tête — présent sur chaque page — et la section
plus complète d'import/export sur [`/config`](https://washy-washy.ryankes.eu/config/)
prennent tous les deux le même fichier JSON `{ machine, chart }` (voir
[les fichiers de grille et de machine](/fr/docs/chart-and-machine/)), le
valident, et le stockent dans le `localStorage` du navigateur. À partir de
là, chaque page lit cette configuration au lieu de celle fournie par défaut,
jusqu'à ce que tu l'effaces.

Modifier sur `/config` ou [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
fonctionne de la même façon : un enregistrement écrit la configuration
modifiée dans le même stockage. Rien n'est envoyé à un serveur ici — une
configuration ne quitte jamais ton navigateur, et un autre navigateur ou des
données de site effacées repartent de l'exemple fourni par défaut.

`/config` a aussi un lien de téléchargement, qui réécrit la configuration
actuellement active — celle par défaut ou la tienne — sous la même forme
JSON que celle que tu importerais. C'est l'aller-retour pour la modifier
ailleurs sur une copie, ou pour transmettre ta configuration à quelqu'un
d'autre.

<img class="theme-shot" data-variant="light" src="/docs/media/config-chart-cards-light.png" alt="La page de configuration : résumé de la machine en lecture seule, contrôles d'import/export, et chaque tas sous forme de carte modifiable" />
<img class="theme-shot" data-variant="dark" src="/docs/media/config-chart-cards-dark.png" alt="La page de configuration : résumé de la machine en lecture seule, contrôles d'import/export, et chaque tas sous forme de carte modifiable" />

## Bascule de thème

L'en-tête a aussi une bascule clair/sombre, juste à côté de « Importer une
configuration » sur chaque page. Si tu n'y touches pas, le site suit le
réglage `prefers-color-scheme` de ton système ou de ton navigateur, comme
avant que cette fonction existe. Cliquer dessus fixe un choix explicite à la
place, stocké dans `localStorage`, qui prend alors le pas sur ce réglage
système sur chaque page et à chaque future visite — jusqu'à ce que tu
recliques dessus. C'est une bascule à deux états, pas un sélecteur : il n'y
a pas d'option séparée « revenir au système ».

## Navigation au clavier

Le site répond aussi à une poignée de raccourcis façon vim, montés une seule
fois dans l'en-tête pour qu'ils fonctionnent sur chaque page — cette
documentation comprise :

- `j` et `k` font défiler la page vers le bas et vers le haut.
- `g` `g` (appuyer deux fois sur `g`) saute en haut de la page.
- `G` (majuscule-g) saute en bas de la page.
- `/` donne le focus au champ de recherche propre à la page — la recherche
  de tas sur la page d'accueil, par exemple — sans taper de barre oblique
  dedans.
- `?` (majuscule-?) ouvre une fenêtre d'aide qui les liste tous ; `Échap` ou
  un clic à l'extérieur la referme.

La même fenêtre s'ouvre aussi depuis le bouton `?` dans l'en-tête, pour
quiconque utilise une souris ou un lecteur d'écran plutôt que le clavier.
Aucun de ces raccourcis ne se déclenche pendant que tu tapes dans un champ
de texte, une zone de texte, un menu déroulant ou tout autre élément
modifiable — la saisie normale l'emporte toujours.

## Filtres

La page d'accueil filtre par coupe voulue (grille complète, lavage
seulement, repassage seulement) et par une recherche libre de tas, plus un
volet « Avancé » — fermé par défaut — pour filtrer par programme, température
ou essorage précis, et une recherche de détergent. Tous réduisent la même
liste ; un tas doit correspondre à tous les filtres actifs pour s'afficher.

Les sélecteurs de programme, température et essorage n'offrent jamais que
des valeurs qui laisseraient encore au moins un tas affiché, compte tenu de
la recherche de tas et de ce que tu as déjà choisi dans Avancé — tu ne peux
donc pas tomber sur une combinaison qui te laisse une grille vide. Les
listes se mettent à jour en direct au fur et à mesure que tu changes
d'autres filtres, et si un champ n'a plus rien qui puisse correspondre, il
se désactive de lui-même plutôt que d'afficher des options vides.

Les filtres persistent dans `localStorage` entre les visites, comme une
configuration. Une vue filtrée est aussi partageable : la barre d'adresse
porte `cut`, `pile`, `program`, `temperature`, `spin` et `detergent` comme
paramètres de requête, et une URL qui en porte l'emporte toujours sur ce qui
avait été enregistré lors d'une visite précédente — voir Partager ci-dessous
pour le bouton qui transmet cette URL.

<img class="theme-shot" data-variant="light" src="/docs/media/sheet-filters-light.png" alt="Le volet Avancé ouvert, avec lavage seulement sélectionné" />
<img class="theme-shot" data-variant="dark" src="/docs/media/sheet-filters-dark.png" alt="Le volet Avancé ouvert, avec lavage seulement sélectionné" />

## Partager

À côté des boutons de téléchargement PDF se trouve **Partager cette vue**,
qui envoie l'URL de la page actuelle telle quelle — filtres compris,
puisque la barre d'adresse les porte déjà comme paramètres de requête (voir
Filtres ci-dessus), donc il n'y a rien de plus à empaqueter.

Si tu as une machine ou une grille personnalisée active (voir
[Configuration fournie par défaut vs. configuration active](#configuration-fournie-par-défaut-vs-configuration-active)),
le lien transporte aussi toute cette configuration, ajoutée sous forme de
fragment `#config=` compressé. Quiconque ouvre ce lien récupère exactement
ta machine et ta grille, pas seulement tes filtres — même dans un navigateur
qui n'a jamais touché ton `localStorage`. Rien ici non plus ne touche un
serveur : un fragment n'est jamais envoyé sur le réseau, donc le lien
lui-même reste l'intégralité du transfert, exactement comme un fichier de
configuration importé. Une fois que la page l'a lu et enregistré, elle
efface le fragment de la barre d'adresse — recharge ou repartage à partir de
là, et tu obtiens l'URL courte habituelle du site, pas le lien à usage
unique. Un lien corrompu ou modifié à la main affiche la même erreur limitée
à une ligne et une colonne qu'un import de configuration invalide, et la
page retombe sur ce qui était déjà actif plutôt que de casser. Quand rien de
personnalisé n'est actif, le lien est inchangé par rapport à avant —
filtres seulement.

Il essaie d'abord la fenêtre de partage native du navigateur
(`navigator.share` — Messages, WhatsApp, AirDrop, ce que propose l'OS), et
se rabat sur la copie de l'URL dans le presse-papiers — en affichant
« Copié ! » de la même façon que le bouton Copier le lien d'une carte —
seulement quand cette API n'est pas disponible, ou quand elle est
disponible mais échoue vraiment. Annuler la fenêtre de partage n'est ni
l'un ni l'autre : c'est simplement refuser cette méthode-là, donc rien
d'autre ne se passe et rien n'est copié dans ton dos.

## Export PDF

La page d'accueil a deux boutons de téléchargement, tous deux limités à ce
qui est actuellement filtré sur la page et rendus côté client avec le même
[`@washy-washy/pdf`](https://github.com/alrayyes/washy-washy-pdf) que
`bun run generate` du CLI utilise. Aucun des deux ne génère quoi que ce soit
avant que tu cliques dessus — filtrer la page ne déclenche jamais un rendu en
arrière-plan.

- **Télécharger pour téléphone** écrit la même page étroite, à défilement
  unique, que produit le CLI — pensée pour être lue sur ton téléphone à
  côté de la machine.
- **Télécharger pour imprimer** écrit à la place une feuille A4 : un
  tableau de référence plus une carte détaillée par tas, pensée pour être
  imprimée et affichée.

Une carte individuelle a aussi son propre bouton **Télécharger**, pour un
seul tas à la fois. C'est uniquement le format téléphone — la mise en page
imprimée dessine toujours tout le tableau de référence plus la carte de
chaque tas, donc il n'y a aucun moyen de la limiter à un seul tas comme le
permet le format téléphone.

<img class="theme-shot" data-variant="light" src="/docs/media/sheet-pdf-download-light.png" alt="Les boutons Télécharger et Copier le lien propres à une seule carte" />
<img class="theme-shot" data-variant="dark" src="/docs/media/sheet-pdf-download-dark.png" alt="Les boutons Télécharger et Copier le lien propres à une seule carte" />

**Copier le lien**, à côté du bouton de téléchargement d'une carte, met
l'URL de cette vue filtrée dans ton presse-papiers — le même repli vers le
presse-papiers que le bouton Partager de la page ci-dessus, limité à une
carte.
