# Terrains en forme — suivi des incidents (Sport dans la Ville)

Prototype Next.js 15 + Tailwind 4 + shadcn/ui, servi par un seul conteneur (pages + `/api/*`).

- Public : `/` (carte), `/signaler` (déclaration), `/merci/[id]`, `/suivi/[id]` (stepper).
- Admin : `/admin` (Kanban, affectation prestataire + ETA, résolution, notifications), `/admin/carte`, `/admin/terrains`.
- Compte de démo : `direction@sportdanslaville.com` / `sdlv2026` (surchargeable par `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Données de démo fictives, stockées dans `data/db.json` (volume du conteneur). Menu profil → « Réinitialiser la démo ».

Déploiement sur la VM : voir `podman-compose.web.yml` à la racine du dépôt.
