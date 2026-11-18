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
