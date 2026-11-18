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

// Depuis l'itération 6, la déclaration est globale et ne suppose plus un terrain déjà
// catalogué : le terrain est saisi librement, avec une adresse structurée.
export type Incident = {
  id: string;
  terrainNom: string;
  ville: string;
  codePostal: string;
  adresse: string;
  description: string;
  urgence: NiveauUrgence;
  photoUrl?: string;
  etat: EtatIncident;
  creeLe: string;
  prestataire?: string;
  dateIntervention?: string;
};

const niveauxUrgence: NiveauUrgence[] = ["faible", "moderee", "haute"];
const incidents: Incident[] = [];
let prochainId = 1;

export function tousLesIncidents(): Incident[] {
  return incidents;
}

export function trouverIncident(id: string): Incident | undefined {
  return incidents.find((incident) => incident.id === id);
}

export function affecterPrestataire(
  id: string,
  donnees: { prestataire?: unknown; dateIntervention?: unknown }
): Incident | ErreurValidation {
  const incident = trouverIncident(id);
  if (!incident) return { erreur: "Incident introuvable." };
  const prestataire = typeof donnees.prestataire === "string" ? donnees.prestataire.trim() : "";
  if (!prestataire) {
    return { erreur: "Le prestataire est obligatoire." };
  }
  incident.prestataire = prestataire;
  incident.dateIntervention =
    typeof donnees.dateIntervention === "string" ? donnees.dateIntervention.trim() : undefined;
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
  terrainNom?: unknown;
  ville?: unknown;
  codePostal?: unknown;
  adresse?: unknown;
  description?: unknown;
  urgence?: unknown;
  photoUrl?: unknown;
}): Incident | ErreurValidation {
  const terrainNom = typeof donnees.terrainNom === "string" ? donnees.terrainNom.trim() : "";
  if (!terrainNom) {
    return { erreur: "Le nom du terrain est obligatoire." };
  }
  const urgence = typeof donnees.urgence === "string" ? donnees.urgence : "";
  if (!niveauxUrgence.includes(urgence as NiveauUrgence)) {
    return { erreur: "Le niveau d'urgence est obligatoire (faible, moderee ou haute)." };
  }
  const incident: Incident = {
    id: `inc-${prochainId++}`,
    terrainNom,
    ville: typeof donnees.ville === "string" ? donnees.ville : "",
    codePostal: typeof donnees.codePostal === "string" ? donnees.codePostal : "",
    adresse: typeof donnees.adresse === "string" ? donnees.adresse : "",
    description: typeof donnees.description === "string" ? donnees.description : "",
    urgence: urgence as NiveauUrgence,
    photoUrl: typeof donnees.photoUrl === "string" ? donnees.photoUrl : undefined,
    etat: "nouveau",
    creeLe: new Date().toISOString(),
  };
  incidents.push(incident);
  return incident;
}
