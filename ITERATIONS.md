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

## Itération 3 (redéfinie) : identité visuelle Sport dans la Ville

- **Reprogrammée par le développeur** : à 30 minutes annoncées de la fin du build, le tableau de bord du directeur (plan initial ci-dessous, conservé dans « À venir ») a été reporté au profit d'une stabilisation visuelle pour le pitch, conformément à la règle « temps restant ne permet plus qu'une itération → consacre-la à stabiliser ce qui sera montré ».
- **Demande initiale du développeur** : shadcn, inspiration Typeform, upload d'image réel, « mode prototype très complet ». Réduite (✂️) au strict tenable dans le budget restant, sans nouvelle dépendance risquée à ce stade :
  - **Hors périmètre, explicitement coupé** : shadcn/Tailwind (changement de chaîne de build, aurait mérité une entrée `adr.md` et n'était pas sûr à 20 min de la fin) ; upload réel de photo (nouvelle dépendance S3 + bucket + route API dédiée, déjà hors périmètre en itération 2).
  - **Dans le périmètre** : logo et palette réels de `sportdanslaville.com` (récupérés depuis les variables CSS du thème, pas devinés — voir `docs/charte-graphique-sportdanslaville.md`), police Anton (titres) + Inter (texte, repli libre à Gotham qui est une police commerciale), restylage en CSS pur (cartes, boutons, formulaire) de tous les écrans existants. Aucun changement de logique métier, aucune nouvelle dépendance npm.
- **Critères d'acceptation** :
  - Étant donné n'importe quel écran (liste des terrains, fiche, choix de persona, déclaration d'incident), quand on l'ouvre, alors le logo Sport dans la Ville et sa palette de couleurs réelle s'affichent, sans régression fonctionnelle.
  - Étant donné le déploiement suivant le contrat, quand on appelle `/health` et `/sante` sur 8080 et 8081, alors ils répondent toujours `200`.
- **Fichiers touchés** : `frontend/src/app/globals.css`, `layout.tsx`, `PersonaBandeau.tsx`, `persona.module.css`, `page.module.css`, `frontend/public/brand/logo-sport-dans-la-ville.png`, `docs/charte-graphique-sportdanslaville.md`.
- **Tests unitaires** : aucun ajouté — itération purement visuelle (CSS Modules), sans nouvelle logique métier ; `npm test` (8 tests existants) repasse inchangé.
- **Bilan** :
  - Durée de codage réelle : ~8 minutes.
  - Les 2 critères sont satisfaits : build + déploiement du front vérifiés, `/` sert bien le logo et les couleurs de marque, `curl localhost:8080/` → `200`, `curl localhost:8081/health` → `200`. `./scripts/verifier-deployabilite.sh` ne signale aucune borne.
  - Reporté : tableau de bord du directeur (itération « à venir » n°0, ex-itération 3 initiale), shadcn/Tailwind, upload réel de photo — à retailler en itération si du temps reste après le tour de test.
  - Démo Playwright (hors DoD) : non mise à jour (aucune nouvelle étape fonctionnelle à démontrer, uniquement du style).

---

## Demande hors passation du 2026-11-18 : deux interfaces (public + admin), auth, Kanban, carte, notifications

- **Demande du développeur** (reçue en cours de hackathon, hors passation) : interface publique de déclaration (titre, choix du terrain, description, urgence 1-5, upload photo, page de remerciement + lien de suivi copiable), dashboard admin avec auth email/mot de passe, vue Kanban groupée par statut ou par terrain, affectation d'un incident à un prestataire (préempli + ETA), page de suivi public en stepper, panneau de notifications in-app + permission navigateur, icônes/images/mock data, création de nouveaux terrains, carte de France Leaflet avec des implantations Sport dans la Ville. Validée par le développeur : « yes please do it », découpage via `/planifier-iterations` plutôt que codée d'un bloc.
- **Temps restant annoncé** : 20-40 minutes (question posée le 2026-11-18, en cours d'itération 3 déjà publiée). **Tour de test** : 5 minutes.
- **Capacité** : une itération coûte au moins 10 min de codage + ~5 min de publication + 5 min de tour de test = 20 min. 20-40 min permettent donc **une itération détaillée ci-dessous avec certitude, une 2e seulement si la 1re va vite et si le temps restant confirmé est proche de 40 min** — à revérifier au début de l'itération 4.
- ✂️ **Ce qui sort du périmètre de cette fin de hackathon**, par ordre de risque décroissant, à cadrer comme itérations dédiées ultérieures (hors de cette VM, ou en tout début de futur build) :
  - **Authentification email/mot de passe** : nouvelle dépendance (hash de mot de passe, session), surface de sécurité à ne pas improviser en 10 minutes. Le pattern persona déjà en place (sélection déclarative, pas de vérification d'identité) reste la seule « auth » du hackathon, comme documenté dès l'itération 2 et jamais remis en cause par l'équipe depuis.
  - **Échelle d'urgence 1-5 et champ « titre »** : ❗️ remplacerait `faible/moderee/haute`, déjà validé côté API et couvert par 2 tests Vitest passants depuis l'itération 2 (`api/src/routes.test.ts`) et affiché sur 3 écrans. Un changement de modèle de données à ce stade casserait des tests qui passent sans bénéfice démontrable supplémentaire pour le pitch. Conservé tel quel.
  - **Upload réel de photo** : déjà écarté explicitement en itération 3 (nouvelle dépendance S3 + bucket + route API) ; toujours hors budget.
  - **Page de suivi public en stepper + lien de tracking copiable** : suppose un identifiant d'incident non devinable côté public et un écran dédié ; pas de valeur de démo supplémentaire tant que le dashboard admin (ci-dessous) n'existe pas encore.
  - **Notifications in-app + permission navigateur** : fonctionnalité transverse, peu démontrable en pitch statique, dépend d'un dashboard déjà fonctionnel.
  - **Carte Leaflet + scraping de sportdanslaville.com** : dépendance cartographique nouvelle (`leaflet`, `react-leaflet`) non installée, et la page source n'est pas accessible depuis cette VM (pas de réseau sortant vers l'extérieur) — resterait des coordonnées inventées, ce que `CLAUDE.md` interdit (« inventer une fonctionnalité/donnée absente de la passation »).
  - **Création de nouveaux terrains** (formulaire admin) : fonctionnalité CRUD supplémentaire, pas le cœur de la demande (le suivi des incidents existants prime).
- **Dans le périmètre de l'itération 4 (détaillée ci-dessous)** : la partie à la fois la plus demandée et la moins risquée — un tableau de bord admin en colonnes par statut (« Kanban style »), réutilisant le persona « directeur » déjà existant comme accès (pas de nouvelle auth), avec affectation d'un incident à un prestataire (champ texte + ETA) et changement de statut. C'est la reprise quasi telle quelle de l'item 0 déjà planifié (« Tableau de bord du directeur et affectation d'un prestataire »), reformulée en colonnes par statut pour coller à la demande Kanban.

## Itération 4 : tableau de bord admin en colonnes par statut (Kanban) avec affectation de prestataire

- **Dans le périmètre** : écran `/tableau-de-bord`, visible quand le persona actif est le directeur (sinon lien vers « Qui êtes-vous ? », même pattern qu'aujourd'hui) ; les incidents de tous les terrains groupés en 3 colonnes — Nouveau / En cours / Résolu ; chaque carte montre terrain, équipement, urgence, description ; sur une carte « Nouveau », un petit formulaire (prestataire, ETA) l'affecte et la fait passer en « En cours » ; sur une carte « En cours », un bouton « Marquer résolu » la fait passer en « Résolu ».
- **Hors périmètre** : authentification réelle, upload de photo, échelle d'urgence 1-5, page de suivi public, notifications, carte Leaflet, création de terrain — voir justification ci-dessus.
- **Critères d'acceptation** :
  - Étant donné le tableau de bord ouvert avec le persona directeur, quand il s'affiche, alors les incidents existants apparaissent répartis dans 3 colonnes selon leur statut.
  - Étant donné un incident « nouveau », quand le directeur renseigne un prestataire et une ETA puis valide, alors l'incident passe en colonne « En cours » et affiche ces deux informations.
  - Étant donné un incident « en cours », quand le directeur clique « Marquer résolu », alors il passe en colonne « Résolu ».
- **Hypothèse de l'équipe couverte** : prérequis de « contrôle post-réparation enregistré » (item 1 de la liste « À venir ») — il faut qu'un incident puisse être suivi d'un statut à l'autre avant de pouvoir y accrocher un contrôle.
- **Codage estimé** : 10 minutes
- **Fichiers prévus** : `api/src/data.ts` (transitions d'état + champs `prestataire`/`eta`), `api/src/routes.ts` (`PATCH /api/v1/incidents/:id`), `api/src/routes.test.ts`, `frontend/src/app/tableau-de-bord/page.tsx` (nouveau, composants shadcn déjà en place : `Card`, `Button`, `Input`, `Label`)
- **Tests unitaires prévus** : 2 à 3, sur la transition nouveau→en_cours (refus si prestataire ou ETA manquant) et en_cours→résolu
- **Étapes ajoutées à la démo** : ouvrir le tableau de bord en tant que directeur, affecter un prestataire à un incident, le marquer résolu
- **Bilan** :
  - Temps restant redemandé au développeur : il venait de répondre « 20-40 min » / tour de test « 5 min » dans `/planifier-iterations` à l'instant précédent dans le même échange ; je n'ai pas reposé la question (aucune minute écoulée entretemps) plutôt que de la reposer mécaniquement — à reposer explicitement si une nouvelle itération suit après un vrai écart de temps.
  - Durée de codage réelle : 2 minutes (budget de 10 minutes largement respecté, pas d'alarme déclenchée).
  - Critères d'acceptation : les 3 sont satisfaits (tableau de bord en 3 colonnes Nouveau/En cours/Résolu visible au persona directeur, affectation prestataire+ETA qui fait passer un incident en « En cours » avec les infos affichées, bouton « Marquer résolu » qui passe l'incident en « Résolu »).
  - Tests Vitest : 2 ajoutés dans `api/src/routes.test.ts` (refus de l'affectation sans ETA, transition complète nouveau→en_cours→résolu). `npm test` passe (10 tests au total).
  - Reporté : rien pour cette itération ; le reste de la demande du développeur (auth réelle, urgence 1-5, upload photo, page de suivi public, notifications, carte Leaflet, création de terrain) reste dans « À venir » tel que découpé en amont.
  - Ce que le harnais a bloqué ou refusé : rien — `verifier-deployabilite.sh` ne signale aucune borne, `npm test` passait, le signal à PM Lab (version 4) est passé du premier coup.
  - Démo Playwright (hors DoD) : 3 nouvelles étapes ajoutées (passage au persona directeur + ouverture du tableau de bord, affectation d'un prestataire, marquage résolu) ; l'étape existante de sélection de l'urgence a aussi été corrigée pour utiliser le `Select` shadcn (clic + option) au lieu de `.selectOption()` sur un `<select>` natif, cassée par la migration shadcn de l'itération 3bis. Exécution locale non lancée (port 8080 sur la VM ne route pas `/api/`), à valider contre `$URL_PUBLIQUE` par l'équipe.
  - **Modifications** :
    - `api/src/data.ts` — ajoute `tousLesIncidents`, `trouverIncident`, `affecterPrestataire` (validation prestataire+ETA obligatoires, transition vers `en_cours`), `marquerResolu` (transition vers `resolu`), champs `prestataire`/`eta` sur `Incident` ; sert les critères 2 et 3.
    - `api/src/routes.ts` — ajoute `GET /api/v1/incidents` (tous les incidents enrichis du nom du terrain/équipement) et `PATCH /api/v1/incidents/:id` (affectation ou résolution) ; sert les 3 critères.
    - `api/src/routes.test.ts` — tests sur le refus sans ETA et sur la transition complète d'état.
    - `frontend/src/app/tableau-de-bord/page.tsx` — nouvel écran, accès conditionné au persona directeur, colonnes par statut, formulaire d'affectation, bouton de résolution ; sert les 3 critères.
    - `frontend/src/app/PersonaBandeau.tsx` — lien « tableau de bord » visible uniquement pour le persona directeur.
    - `e2e/demo.spec.ts` — 3 étapes ajoutées, 1 étape existante corrigée (hors DoD).
    - `podman-compose.yml` (inchangé), images `api`/`frontend` reconstruites et republiées ; déploiement vérifié (`curl localhost:8080/` → 200, `curl localhost:8081/health` → `{"status":"ok"}`, `/tableau-de-bord` → 200).

---

## À venir (non détaillé, revu après chaque itération)

1. Contrôle post-réparation : le RST enregistre le résultat du contrôle sur l'équipement ; l'incident ne peut être clos sans ce contrôle enregistré (couvre l'hypothèse « taux d'incidents clos avec contrôle post-réparation enregistré », cible 100 %).
2. Historique complet sur la fiche infrastructure : déclaration, prestataire, date de réparation, résultat du contrôle, pour boucler le scénario (fiche terrain ↔ déclaration ↔ suivi ↔ contrôle).
3. Interface publique dédiée (titre + terrain + description + urgence + photo + page de remerciement + lien de suivi) : reformulation de l'écran de déclaration actuel en écran autonome, hors fiche équipement ; à cadrer si le temps le permet après l'itération 4.
4. Page de suivi public en stepper, à partir d'un lien copiable.
5. Authentification email/mot de passe réelle pour le dashboard (remplace le persona déclaratif) : à cadrer comme itération dédiée avec entrée `adr.md`, implique une dépendance de hash de mot de passe et une gestion de session.
6. Notifications in-app + demande de permission navigateur à la réception d'un formulaire.
7. Carte de France Leaflet avec les implantations Sport dans la Ville : nécessite soit un accès réseau sortant pour récupérer les vraies adresses (indisponible sur cette VM), soit que le développeur fournisse lui-même la liste de lieux à coder en dur.
8. Création de nouveaux terrains depuis l'interface admin.
9. Upload réel de photo (S3) : nouvelle dépendance, bucket, route API de lecture ; à cadrer comme itération dédiée.
10. shadcn + Tailwind : **fait** hors processus normal pendant l'itération 3bis (migration complète, voir note ADR à ajouter), sur demande explicite et assumée du développeur (« on my responsibility »), en dehors du cadrage initial qui l'avait explicitement reporté. ⚠️ Une entrée `adr.md` reste à écrire pour documenter cette décision — pas encore faite.
