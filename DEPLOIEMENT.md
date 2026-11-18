# Déploiement

Application de suivi des infrastructures sportives (terrains, équipements, incidents) pour
l'association **Sport dans la Ville**.

## Services

- `frontend/` : export statique Next.js servi par nginx, port 80 (publié en 8080). **Exposé au
  public.**
- `api/` : service Node sans dépendance, port 8081 (publié en 8081). Appelé en chemin relatif
  `/api/v1/...` par le frontend, jamais par une URL absolue.

## Services externes

Aucun pour l'itération 1 : les terrains et équipements sont des données en dur dans
`api/src/data.ts`, en mémoire (pas de base de données). Rien ne casse en cas de panne externe,
puisqu'il n'y en a pas encore.

## Fragile ou inachevé

- Aucune persistance : un redémarrage du conteneur `api` réinitialise les données (lecture seule
  pour l'instant, donc sans conséquence tant qu'aucune écriture n'existe).
- Pas encore d'authentification ni de rôles (prévu par la passation : sélecteur de persona
  déclaratif, pas de mot de passe).

## Contacts

- Équipe : Équipe 49 (hackathon eXaltemps Solidaire).
- Association : le directeur national des infrastructures, Sport dans la Ville.
