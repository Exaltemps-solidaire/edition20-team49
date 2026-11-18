# Plan d'itérations

- **Source du plan** : proposé par l'agent. Aucun plan d'itérations de l'équipe n'a été trouvé dans la passation (`2-idees-priorisees.md`, `4-prototype.md` et `5-hypotheses.md` sont vides — « Pas encore produit » — et `passation.json` n'a pas de clé `iterations`). Le découpage ci-dessous reprend `cadrage/7-prd.md` (scénario idéal, plan de livraison, hors périmètre) et `cadrage/1-problematique.md` (hypothèses à vérifier).
- **Temps restant annoncé** : 90 minutes (question posée le 2026-11-18 à l'ouverture de `/planifier-iterations`).
- **Tour de test de l'équipe** : 10 minutes (valeur par défaut, le développeur ne savait pas).
- **Capacité** : une itération pleine coûte au moins 10 min de codage + ~5 min de publication + 10 min de tour de test = 25 min. 90 min permettent donc **3 itérations complètes avec marge** (75 min, 15 min de marge) ; une 4e itération courte (contrôle post-réparation, codage plus léger) pourra s'ajouter si le temps restant à ce moment-là le permet — à revérifier à chaque itération, l'heure de fin peut bouger.
- **Hors périmètre** (repris de `cadrage/7-prd.md`) : suivi des jeunes (reste dans Digisport), contrôles périodiques planifiés, gestion des contrats/factures des prestataires, avis du bureau de contrôle (S/SAR/NS), création de comptes et gestion des droits, règles de vieillissement des équipements, règle de responsabilité juridique des terrains sans convention. Pas de connexion ni de mot de passe : un sélecteur de persona ouvert remplace l'authentification.
- **Pile** : le squelette déjà posé (api/ Node en mémoire, frontend/ Next.js) n'a pas de base de données. Les itérations 1 et 2 restent donc en mémoire ; voir l'alerte ⚠️ dans l'itération 2 sur la persistance.

⚠️ **Point DoR à signaler** : `cadrage/3-solution.md` ne porte pas de mention explicite « X écran(s) » pour l'idée retenue (contrairement aux idées écartées, marquées « 0 écran(s) »), et `prototype/index.html` n'existe pas dans la passation. La description écran par écran existe bien, mais dans `cadrage/7-prd.md` (section « Le scénario idéal de cette version ») : Fiche infrastructure, Déclaration d'incident, Tableau de bord des incidents, Suivi de l'incident, Contrôle post-réparation. Je considère la DoR remplie sur le fond (le périmètre écran est clair) mais le signale car ce n'est pas le fichier que la DoR nomme littéralement.

---

## Itération 1 : consulter la fiche d'un terrain et l'état de ses équipements

- **Plan validé** par le développeur le 2026-11-18 (temps restant reconfirmé à ~90 minutes au début de l'itération).
- **Dans le périmètre** : liste des terrains (données en dur, noms fictifs), fiche d'un terrain avec ses équipements (but, panier, agrès) et leur état courant (bon / à surveiller / hors service) ; `.env.example` et `DEPLOIEMENT.md` à la racine, conformes au contrat de déployabilité.
- **Hors périmètre** : déclaration d'incident, tableau de bord, sélection de persona, toute écriture de données, base de données (lecture seule, données en dur acceptables tant que rien n'est créé).
- **Critères d'acceptation** :
  - Étant donné l'application déployée, quand on ouvre l'écran principal, alors la liste des terrains s'affiche avec leur nombre d'équipements.
  - Étant donné un terrain choisi dans la liste, quand on ouvre sa fiche, alors ses équipements et leur état s'affichent.
  - Étant donné le déploiement suivant le contrat, quand on appelle `/health` et `/sante` sur le port 8080 et sur le port 8081, alors ils répondent `200`.
- **Hypothèse de l'équipe couverte** : aucune hypothèse mesurée directement ; cette itération pose la fiche équipement identifiée, prérequis de l'hypothèse « chaque incident déclaré est rattaché à un équipement identifié » (cible 100 %).
- **Codage estimé** : 10 minutes
- **Fichiers prévus** : `api/src/data.ts` (terrains et équipements en dur), `api/src/routes.ts` (routes `GET /api/v1/terrains`, `GET /api/v1/terrains/:id`), `frontend/src/app/page.tsx` (liste des terrains), `frontend/src/app/terrains/[id]/page.tsx` (fiche), `.env.example`, `DEPLOIEMENT.md`
- **Tests unitaires prévus** : 1 à 3, sur la fonction qui retrouve un terrain par id et sur le regroupement des équipements par état
- **Étapes ajoutées à la démo** : ouvrir l'application, voir la liste des terrains, ouvrir la fiche d'un terrain
- **Bilan** :
  - Durée de codage réelle : 3 minutes (budget de 10 minutes largement respecté, pas d'alarme déclenchée).
  - Critères d'acceptation : les 3 sont satisfaits (liste des terrains avec leur nombre d'équipements, fiche d'un terrain avec équipements et états, `/health` et `/sante` répondent `200` sur 8080 et 8081).
  - Tests Vitest : 6 ajoutés dans `api/src/routes.test.ts` (recherche d'un terrain par id, regroupement des équipements par état, routes `GET /api/v1/terrains` et `GET /api/v1/terrains/:id`). `npm test` passe.
  - Reporté : rien pour cette itération.
  - ⚠️ Démarrage de la plateforme : le premier démarrage (`gitlab-ci-local --force-shell-executor`) a buté sur le quota anonyme de Docker Hub (`toomanyrequests`) pour plusieurs images (registre, Postgres, S3/Seaweedfs, Temporal, Casdoor→Umami en cascade). `registry.internal` et `postgres.internal` ont été récupérés en relançant `podman compose -p core up -d registry postgres` depuis `core-platform/core-platform` une fois le script terminé ; le reste (S3, Temporal, Casdoor, Umami) n'est pas nécessaire à cette itération et n'a pas été relancé. À surveiller si une itération future a besoin de l'un de ces services.
  - Ce que le harnais a bloqué ou refusé : rien — `verifier-deployabilite.sh` ne signale aucune borne ni alarme, `npm test` passait, le signal à PM Lab est passé du premier coup.
  - Démo Playwright (hors DoD) : mise à jour avec les 2 nouvelles étapes, mais l'exécution locale contre `http://localhost:8080` échoue — attendu, puisque sur cette machine le port 8080 ne route pas `/api/` (c'est le rôle du proxy d'entrée externe, injoignable d'ici). Seule une exécution contre `$URL_PUBLIQUE` depuis un vrai navigateur peut la valider ; non lancée depuis la VM par construction.
  - **Modifications** :
    - `api/src/data.ts` — données en dur de 3 terrains et leurs équipements (état bon/à surveiller/hors service) ; sert les 3 critères.
    - `api/src/routes.ts` — ajoute `GET /api/v1/terrains` (résumé + nombre d'équipements) et `GET /api/v1/terrains/:id` (fiche complète) ; sert les critères 1 et 2.
    - `api/src/routes.test.ts` — tests sur le routeur et sur `trouverTerrain` / regroupement par état.
    - `frontend/src/app/page.tsx` — liste des terrains, appel relatif `/api/v1/terrains` ; sert le critère 1.
    - `frontend/src/app/terrains/[id]/page.tsx` + `FicheTerrainClient.tsx` — fiche d'un terrain (route statique pré-rendue pour `t1`/`t2`/`t3` via `generateStaticParams`, données lues côté client sur l'API) ; sert le critère 2.
    - `frontend/src/app/page.module.css` — styles de la liste et de la fiche.
    - `.env.example`, `DEPLOIEMENT.md` — exigés par le contrat de déployabilité ; sert le critère 3.
    - `api/Dockerfile`, `frontend/Dockerfile` — images de base qualifiées `docker.io/library/...` (recette du serveur, étape 4).
    - `podman-compose.yml` — déploiement sur 8080 (frontend) / 8081 (api), rejoint `core-network`.
    - `e2e/demo.spec.ts` — 2 étapes ajoutées (hors DoD).

## Itération 2 : choisir son rôle et déclarer un incident

- **Plan validé** par le développeur le 2026-11-18 (temps restant annoncé : 40 minutes, contre ~75 minutes attendues à ce stade — ⚠️ écart à surveiller, voir note de replanification en fin d'itération).
- **Dans le périmètre** : écran « Qui êtes-vous ? » avec une liste fixe de personas (un RST, le directeur national des infrastructures), bouton « Déclarer un incident » depuis la fiche d'un équipement, formulaire (lieu précis, description, niveau d'urgence ; un champ texte pour l'URL d'une photo, pas d'upload réel) ; l'incident créé est rattaché à l'équipement et visible sur sa fiche, à l'état « nouveau ».
- **Hors périmètre** : upload réel de photo, tableau de bord du directeur, affectation de prestataire, contrôle post-réparation, authentification réelle (aucune vérification d'identité : le choix de persona est déclaratif).
- **Critères d'acceptation** :
  - Étant donné l'écran « Qui êtes-vous ? », quand on choisit un persona, alors son nom et son rôle s'affichent en haut de l'écran et restent actifs en changeant d'écran.
  - Étant donné la fiche d'un équipement, quand le RST déclare un incident avec lieu, description et urgence, alors l'incident apparaît sur la fiche de cet équipement à l'état « nouveau ».
  - Étant donné un formulaire de déclaration sans urgence choisie, quand on tente de l'envoyer, alors il est refusé avec un message clair.
- **Hypothèse de l'équipe couverte** : « Nous croyons que le RST peut saisir lieu, photos, description et niveau d'urgence d'un incident en quelques gestes depuis son téléphone » et « un portail de déclaration relié à la fiche de chaque infrastructure permet de disposer d'une base exhaustive des incidents » (rattachement à l'équipement).
- **Codage estimé** : 10 minutes
- **Fichiers prévus** : composant/contexte de persona (frontend), écran « Qui êtes-vous ? », formulaire de déclaration sur la fiche équipement, `api/src/routes.ts` (route `POST /api/v1/incidents`), `api/src/data.ts` (magasin des incidents en mémoire)
- **Tests unitaires prévus** : 1 à 3, sur la validation du formulaire (urgence et équipement obligatoires) et sur le rattachement de l'incident créé à l'équipement visé
- **Étapes ajoutées à la démo** : choisir le persona RST, ouvrir une fiche équipement, déclarer un incident, vérifier qu'il apparaît
- **Bilan** :
  - Durée de codage réelle : 3 minutes (budget de 10 minutes largement respecté, pas d'alarme déclenchée).
  - Critères d'acceptation : les 3 sont satisfaits (persona affiché et persistant via le bandeau + `localStorage`, déclaration d'incident par le RST visible sur la fiche équipement à l'état « nouveau », formulaire sans urgence refusé avec message d'erreur affiché).
  - Tests Vitest : 2 ajoutés dans `api/src/routes.test.ts` (refus sans urgence/équipement valide, rattachement de l'incident créé à l'équipement visé et visibilité sur la fiche du terrain). `npm test` passe (8 tests au total).
  - Reporté : rien pour cette itération.
  - ⚠️ Temps restant annoncé en DoR : 40 minutes, contre ~75 minutes attendues par la planification initiale (90 min à l'ouverture, 3 itérations complètes visées). Avec ~25 minutes minimum par itération (codage + publication + tour de test), il ne reste de la marge que pour l'itération 3 elle-même, sans tampon ni 4e itération. Je propose aux cadreurs de traiter l'itération 3 comme la dernière itération de contenu, et de réserver tout temps restant ensuite à la stabilisation plutôt qu'au contrôle post-réparation — à valider par l'équipe.
  - Ce que le harnais a bloqué ou refusé : rien — `verifier-deployabilite.sh` ne signale aucune borne, `npm test` passait, le signal à PM Lab est passé du premier coup.
  - Démo Playwright (hors DoD) : 2 nouvelles étapes ajoutées (choix du persona RST, déclaration d'un incident) ; exécution locale non lancée pour la même raison qu'en itération 1 (port 8080 sur la VM ne route pas `/api/`), à valider contre `$URL_PUBLIQUE` par l'équipe.
  - **Modifications** :
    - `api/src/data.ts` — magasin des incidents en mémoire, `trouverEquipement`, `incidentsDe`, `creerIncident` avec validation (équipement existant + urgence obligatoire) ; sert les critères 2 et 3.
    - `api/src/routes.ts` — ajoute `POST /api/v1/incidents` et enrichit `GET /api/v1/terrains/:id` pour inclure les incidents de chaque équipement ; sert les critères 2 et 3.
    - `api/src/server.ts` — lit le corps des requêtes (POST) avant de router ; nécessaire pour la nouvelle route.
    - `api/src/routes.test.ts` — tests sur la validation et le rattachement incident→équipement.
    - `frontend/src/app/persona.tsx` — contexte React des personas (RST, directeur), persistance `localStorage` ; sert le critère 1.
    - `frontend/src/app/PersonaBandeau.tsx`, `persona.module.css` — bandeau affichant le persona actif, lien pour en changer ; sert le critère 1.
    - `frontend/src/app/qui-etes-vous/page.tsx` — écran de choix de persona ; sert le critère 1.
    - `frontend/src/app/layout.tsx` — intègre le `PersonaProvider` et le bandeau à toutes les pages.
    - `frontend/src/app/terrains/[id]/FicheTerrainClient.tsx` — formulaire de déclaration d'incident par équipement (lieu, description, urgence, URL photo), affichage des incidents existants, message d'erreur si refus serveur ; sert les critères 2 et 3.
    - `e2e/demo.spec.ts` — 2 étapes ajoutées (hors DoD).
    - `podman-compose.yml`, images `api`/`frontend` reconstruites et republiées (aucun changement de configuration, juste redéploiement).

⚠️ Les incidents créés dans cette itération restent en mémoire dans l'API (pas de base de données dans le squelette actuel) : un redémarrage du conteneur les perd, ce qui s'écarte du contrat de déployabilité (point 6, persistance). Acceptable pour une démo de hackathon, mais à signaler au développeur avant la stabilisation finale — ajouter une base deviendrait une itération à part entière si le temps le permet.

## Itération 3 : tableau de bord du directeur et affectation d'un prestataire

- **Dans le périmètre** : écran tableau de bord listant tous les incidents déclarés (équipement, terrain, urgence, description, état) ; action « affecter un prestataire et planifier une date » qui fait passer l'incident à l'état « en cours ».
- **Hors périmètre** : contrôle post-réparation et clôture (itération suivante), gestion des contrats/factures de prestataires (un simple champ texte nom suffit), notifications.
- **Critères d'acceptation** :
  - Étant donné le persona « directeur national des infrastructures », quand il ouvre le tableau de bord, alors tous les incidents déclarés s'affichent avec leur équipement et leur urgence.
  - Étant donné un incident à l'état « nouveau », quand le directeur renseigne un prestataire et une date, alors l'incident passe à l'état « en cours » et les deux informations restent visibles.
  - Étant donné un incident sans prestataire ni date renseignés, quand on tente de le passer « en cours », alors l'action est refusée.
- **Hypothèse de l'équipe couverte** : « un outil commun permettant d'affecter un prestataire, de planifier la résolution et de suivre les étapes donne au directeur la visibilité nécessaire » (cible : taux de résolution ≥ 70 % dans l'année — mesurable seulement après usage réel, cette itération pose l'outil).
- **Codage estimé** : 10 minutes
- **Fichiers prévus** : écran tableau de bord (frontend), formulaire d'affectation, `api/src/routes.ts` (route `PATCH /api/v1/incidents/:id`), `api/src/data.ts` (transition d'état)
- **Tests unitaires prévus** : 1 à 3, sur la transition d'état (refus si prestataire ou date manquant, passage à « en cours » sinon)
- **Étapes ajoutées à la démo** : choisir le persona directeur, ouvrir le tableau de bord, affecter un prestataire à l'incident créé en itération 2
- **Bilan** : _à remplir en fin d'itération_

---

## À venir (non détaillé, revu après chaque itération)

1. Contrôle post-réparation : le RST enregistre le résultat du contrôle sur l'équipement ; l'incident ne peut être clos sans ce contrôle enregistré (couvre l'hypothèse « taux d'incidents clos avec contrôle post-réparation enregistré », cible 100 %).
2. Historique complet sur la fiche infrastructure : déclaration, prestataire, date de réparation, résultat du contrôle, pour boucler le scénario (fiche terrain ↔ déclaration ↔ suivi ↔ contrôle).
3. Stabilisation finale pour le pitch, si le temps restant ne permet plus qu'une itération : figer ce qui fonctionne, vérifier la démo de bout en bout plutôt qu'ajouter du périmètre.
