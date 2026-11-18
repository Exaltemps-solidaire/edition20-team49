# Charte graphique — Sport dans la Ville

Extraite le 2026-11-18 depuis le CSS réellement servi par `sportdanslaville.com`
(thème WordPress `sportdanslaville`, fichier `piloblocks/build/main.css`), pas
une supposition visuelle. À utiliser comme référence pour l'identité du front
de l'application, en cohérence avec `cadrage/3-solution.md` / le prototype
retenu, qui restent prioritaires en cas de conflit.

## Couleurs

| Rôle | Variable source | Valeur |
|---|---|---|
| Primaire (bleu) | `--color-primary` | `#6294c2` |
| Primaire clair | `--color-primary-100` | `#f0f4f9` |
| Primaire clair 2 | `--color-primary-200` | `#dee7f2` |
| Secondaire (vert anis) | `--color-secondary` | `#e1e474` |
| Secondaire foncé | `--color-secondary-600` | `#ccd129` |
| Noir / texte | `--color-black` | `#1f3346` |
| Blanc | `--color-white` | `#ffffff` |
| Logo, fond clair | `--logo-color-secondary` | `#1f3346` |
| Logo, fond coloré/sombre | `--logo-color-primary` | `#ffffff` (bascule en `#6294c2` sur fond `.logo-blue`) |

Gris et rouge/vert d'état sont définis en `oklch()` (gris `--color-gray-100/500/600`,
rouge `--color-red-*`, vert `--color-green-*`) — utiles pour des messages
d'erreur/succès cohérents avec le site si besoin, non prioritaires pour le
hackathon.

## Typographies

- **Titres** : `Anton` (une seule graisse, 400, très condensée/impact — usage
  display, pas pour du texte courant).
- **Texte courant** : `Gotham` (graisses 400 "Book" et 700 "Bold").
- Repli système : `ui-sans-serif, system-ui, sans-serif` (`--font-sans`).

⚠️ `Gotham` est une police commerciale (licence Hoefler&Co), chargée en
`.woff2` depuis le thème du site — elle n'est pas libre de droits et ne doit
**pas** être recopiée/hébergée dans ce dépôt public. Pour le hackathon,
utiliser un repli visuellement proche et libre si besoin d'un rendu "display" :
`Montserrat` ou `Inter` (Google Fonts) en graisses 400/700 couvrent l'esprit
sans problème de licence. `Anton` est, elle, disponible librement sur Google
Fonts et peut être reprise telle quelle pour les titres.

## Échelle de tailles (titres)

Définie en `clamp()` responsive (`--font-size-title-*`), du plus petit
(`lg`, ~20px) au plus grand (`6xl`, 64→130px). Pas besoin de reproduire
l'échelle exacte pendant le hackathon ; retenir juste le principe : titres
très grands et impactants (police Anton), texte courant sobre (Gotham/repli).

## Logo

Le logo change de variante selon le fond (`--logo-color-primary` /
`--logo-color-secondary`), géré via la classe `.logo-blue` côté site ; pas
d'asset logo extrait ici (pas de fichier `logo.*` identifiable dans le HTML
récupéré). Si un logo officiel est nécessaire, le demander à l'association
via la passation plutôt que de le réutiliser depuis le site sans autorisation.

## Ce qui n'a pas pu être extrait

Pas de guide de style publié (pas de PDF "brand guidelines" public trouvé).
Cette fiche vient uniquement du CSS live du site, donc fiable sur les valeurs
mais incomplète sur l'usage (marges, grille, composants). En cas de doute,
le prototype retenu dans la passation (`prototype/index.html`) prime sur
cette charte.
