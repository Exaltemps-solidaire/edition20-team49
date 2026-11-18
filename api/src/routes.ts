// Routage de l'API, sans dépendance : une fonction pure, testable sans démarrer de serveur.
// Le proxy d'entrée envoie /api/... à ce service sans retirer le préfixe : les routes métier
// se déclarent donc sous /api/v1/... ; /health et /sante restent à la racine (port 8081).

import {
  affecterPrestataire,
  creerIncident,
  marquerResolu,
  terrains,
  tousLesIncidents,
  trouverTerrain,
} from "./data.ts";

export type Reponse = { statut: number; corps?: unknown };

export function router(methode: string, url: string, corpsBrut?: string): Reponse {
  const chemin = new URL(url, "http://api").pathname;

  if (methode === "GET" && (chemin === "/health" || chemin === "/sante")) {
    return { statut: 200, corps: { status: "ok" } };
  }

  if (methode === "GET" && chemin === "/api/v1/terrains") {
    const resume = terrains.map((terrain) => ({
      id: terrain.id,
      nom: terrain.nom,
      ville: terrain.ville,
      nombreEquipements: terrain.equipements.length,
    }));
    return { statut: 200, corps: resume };
  }

  const correspondanceFiche = chemin.match(/^\/api\/v1\/terrains\/([^/]+)$/);
  if (methode === "GET" && correspondanceFiche) {
    const terrain = trouverTerrain(correspondanceFiche[1]);
    if (!terrain) {
      return { statut: 404 };
    }
    return { statut: 200, corps: terrain };
  }

  if (methode === "POST" && chemin === "/api/v1/incidents") {
    let donnees: Record<string, unknown> = {};
    try {
      donnees = corpsBrut ? JSON.parse(corpsBrut) : {};
    } catch {
      return { statut: 400, corps: { erreur: "Corps de la requête invalide (JSON attendu)." } };
    }
    const resultat = creerIncident(donnees);
    if ("erreur" in resultat) {
      return { statut: 400, corps: resultat };
    }
    return { statut: 201, corps: resultat };
  }

  if (methode === "GET" && chemin === "/api/v1/incidents") {
    return { statut: 200, corps: tousLesIncidents() };
  }

  const correspondancePatch = chemin.match(/^\/api\/v1\/incidents\/([^/]+)$/);
  if (methode === "PATCH" && correspondancePatch) {
    let donnees: Record<string, unknown> = {};
    try {
      donnees = corpsBrut ? JSON.parse(corpsBrut) : {};
    } catch {
      return { statut: 400, corps: { erreur: "Corps de la requête invalide (JSON attendu)." } };
    }
    const id = correspondancePatch[1];
    const resultat =
      donnees.etat === "resolu"
        ? marquerResolu(id)
        : affecterPrestataire(id, donnees);
    if ("erreur" in resultat) {
      return { statut: resultat.erreur === "Incident introuvable." ? 404 : 400, corps: resultat };
    }
    return { statut: 200, corps: resultat };
  }

  return { statut: 404 };
}
