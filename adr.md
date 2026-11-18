# Architecture Decision Record (ADR)

Journal des décisions d'architecture prises pendant le hackathon (dépendance nouvelle, stockage, pattern structurant).

Une entrée par décision, ajoutée à la fin, au format :

```
### AAAA-MM-JJ — <titre court>

- **Décision** : ce qui a été choisi
- **Contexte** : le problème à résoudre
- **Alternatives envisagées** : les autres options, et pourquoi elles sont écartées
- **Conséquences** : les compromis acceptés
```

Le fichier est un journal : on ajoute, on ne réécrit pas. Pour revenir sur une décision, une nouvelle entrée le dit explicitement.

---

## Décisions

### 2026-11-18 — Prototype « Terrains en forme » dans `web/`, servi par un seul conteneur Next.js

- **Décision** : le prototype complet (formulaire public, suivi en étapes, espace direction avec Kanban, carte, terrains) vit dans `web/`, en Next.js 15 + Tailwind 4 + shadcn/ui, en serveur Next « standalone ». Un seul conteneur sert les pages et `/api/*` ; il est publié sur 8080 et 8081 (`podman-compose.web.yml`, projet `team49web`).
- **Contexte** : la passerelle envoie `/api/*` sur 8081 et le reste sur 8080. Le prototype a besoin de rendu serveur (actions serveur, session) et ne peut pas être un export statique derrière nginx.
- **Alternatives envisagées** : faire évoluer `frontend/` (export statique) + `api/` — écarté pour ne pas toucher au travail en cours de l'équipe dans ces dossiers ; séparer front et API en deux services — inutile, Next sert les deux.
- **Conséquences** : les anciens conteneurs `team49_frontend_1` et `team49_api_1` sont arrêtés, pas supprimés. Retour arrière : `podman compose -f podman-compose.web.yml -p team49web down` puis `podman start team49_frontend_1 team49_api_1`.

### 2026-11-18 — Stockage du prototype dans un fichier JSON sur un volume

- **Décision** : incidents, terrains et prestataires sont stockés dans `/app/data/db.json`, sur le volume `web-data`, initialisé avec des données de démonstration fictives (adresses, contacts, prestataires inventés). Les photos sont compressées côté navigateur et stockées en data URL.
- **Contexte** : il faut des données persistantes pour la démo, sans dépendre de la mise en place de Postgres et du stockage S3.
- **Alternatives envisagées** : Postgres de la plateforme (`postgres.internal`) — prévu pour la suite ; S3 pour les photos — prévu pour la suite, servi par l'API.
- **Conséquences** : un seul processus écrit le fichier (écritures sérialisées). Ne tient pas la charge d'un vrai usage. Bouton « Réinitialiser la démo » dans le menu profil.

### 2026-11-18 — Authentification de démo par cookie signé

- **Décision** : un compte direction de démonstration, session dans un cookie `httpOnly` signé en HMAC. Le secret `AUTH_SECRET` est généré sur la VM dans `web.env`, ignoré par git.
- **Contexte** : la passation demande une connexion email / mot de passe pour l'espace direction.
- **Alternatives envisagées** : Casdoor (OIDC, `idp.internal`) — plus robuste, prévu si le prototype est retenu.
- **Conséquences** : pas de gestion des utilisateurs. Le compte se surcharge par `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
