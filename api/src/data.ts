// Données en dur pour l'itération 1 : pas de base de données dans le squelette actuel.
// Noms fictifs, villes publiques (QPV) à titre d'exemple, conformément à la passation.

export type EtatEquipement = "bon" | "a_surveiller" | "hors_service";

export type Equipement = {
  id: string;
  nom: string;
  type: "but" | "panier" | "agres";
  etat: EtatEquipement;
};

export type Terrain = {
  id: string;
  nom: string;
  ville: string;
  equipements: Equipement[];
};

export const terrains: Terrain[] = [
  {
    id: "t1",
    nom: "Terrain Les Minguettes",
    ville: "Vénissieux",
    equipements: [
      { id: "t1-e1", nom: "But côté nord", type: "but", etat: "bon" },
      { id: "t1-e2", nom: "But côté sud", type: "but", etat: "a_surveiller" },
      { id: "t1-e3", nom: "Panier de basket", type: "panier", etat: "bon" },
    ],
  },
  {
    id: "t2",
    nom: "Terrain La Duchère",
    ville: "Lyon",
    equipements: [
      { id: "t2-e1", nom: "But unique", type: "but", etat: "hors_service" },
      { id: "t2-e2", nom: "Agrès de musculation", type: "agres", etat: "bon" },
    ],
  },
  {
    id: "t3",
    nom: "Terrain Mas du Taureau",
    ville: "Vaulx-en-Velin",
    equipements: [
      { id: "t3-e1", nom: "Panier côté est", type: "panier", etat: "bon" },
      { id: "t3-e2", nom: "Panier côté ouest", type: "panier", etat: "bon" },
      { id: "t3-e3", nom: "But", type: "but", etat: "a_surveiller" },
    ],
  },
];

export function trouverTerrain(id: string): Terrain | undefined {
  return terrains.find((terrain) => terrain.id === id);
}

export function trouverEquipement(id: string): Equipement | undefined {
  for (const terrain of terrains) {
    const equipement = terrain.equipements.find((e) => e.id === id);
    if (equipement) return equipement;
  }
  return undefined;
}

// Magasin des incidents en mémoire : pas de base de données dans le squelette actuel (voir ⚠️ ITERATIONS.md).
export type NiveauUrgence = "faible" | "moderee" | "haute";
export type EtatIncident = "nouveau" | "en_cours" | "resolu";

export type Incident = {
  id: string;
  equipementId: string;
  lieu: string;
  description: string;
  urgence: NiveauUrgence;
  photoUrl?: string;
  etat: EtatIncident;
  creeLe: string;
  prestataire?: string;
  eta?: string;
};

const niveauxUrgence: NiveauUrgence[] = ["faible", "moderee", "haute"];
const incidents: Incident[] = [];
let prochainId = 1;

export function incidentsDe(equipementId: string): Incident[] {
  return incidents.filter((incident) => incident.equipementId === equipementId);
}

export function tousLesIncidents(): Incident[] {
  return incidents;
}

export function trouverIncident(id: string): Incident | undefined {
  return incidents.find((incident) => incident.id === id);
}

export function affecterPrestataire(
  id: string,
  donnees: { prestataire?: unknown; eta?: unknown }
): Incident | ErreurValidation {
  const incident = trouverIncident(id);
  if (!incident) return { erreur: "Incident introuvable." };
  const prestataire = typeof donnees.prestataire === "string" ? donnees.prestataire.trim() : "";
  const eta = typeof donnees.eta === "string" ? donnees.eta.trim() : "";
  if (!prestataire || !eta) {
    return { erreur: "Le prestataire et l'ETA sont obligatoires." };
  }
  incident.prestataire = prestataire;
  incident.eta = eta;
  incident.etat = "en_cours";
  return incident;
}

export function marquerResolu(id: string): Incident | ErreurValidation {
  const incident = trouverIncident(id);
  if (!incident) return { erreur: "Incident introuvable." };
  incident.etat = "resolu";
  return incident;
}

export type ErreurValidation = { erreur: string };

export function creerIncident(donnees: {
  equipementId?: unknown;
  lieu?: unknown;
  description?: unknown;
  urgence?: unknown;
  photoUrl?: unknown;
}): Incident | ErreurValidation {
  const equipementId = typeof donnees.equipementId === "string" ? donnees.equipementId : "";
  if (!equipementId || !trouverEquipement(equipementId)) {
    return { erreur: "L'équipement visé est obligatoire et doit exister." };
  }
  const urgence = typeof donnees.urgence === "string" ? donnees.urgence : "";
  if (!niveauxUrgence.includes(urgence as NiveauUrgence)) {
    return { erreur: "Le niveau d'urgence est obligatoire (faible, moderee ou haute)." };
  }
  const incident: Incident = {
    id: `inc-${prochainId++}`,
    equipementId,
    lieu: typeof donnees.lieu === "string" ? donnees.lieu : "",
    description: typeof donnees.description === "string" ? donnees.description : "",
    urgence: urgence as NiveauUrgence,
    photoUrl: typeof donnees.photoUrl === "string" ? donnees.photoUrl : undefined,
    etat: "nouveau",
    creeLe: new Date().toISOString(),
  };
  incidents.push(incident);
  return incident;
}
