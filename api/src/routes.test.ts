import { describe, expect, it } from "vitest";
import { router } from "./routes.ts";
import { trouverTerrain } from "./data.ts";

describe("router", () => {
  it("répond 200 sur les deux routes de santé", () => {
    expect(router("GET", "/health").statut).toBe(200);
    expect(router("GET", "/sante?x=1").statut).toBe(200);
  });

  it("répond 404 sur une route inconnue ou une méthode non prévue", () => {
    expect(router("GET", "/api/v1/inconnue").statut).toBe(404);
    expect(router("POST", "/health").statut).toBe(404);
  });

  it("liste les terrains avec leur nombre d'équipements", () => {
    const reponse = router("GET", "/api/v1/terrains");
    expect(reponse.statut).toBe(200);
    const corps = reponse.corps as Array<{ id: string; nombreEquipements: number }>;
    expect(corps.length).toBeGreaterThan(0);
    expect(corps[0]).toHaveProperty("nombreEquipements");
  });

  it("répond 404 sur la fiche d'un terrain inconnu", () => {
    expect(router("GET", "/api/v1/terrains/inconnu").statut).toBe(404);
  });
});

describe("trouverTerrain", () => {
  it("retrouve un terrain existant par id et pas un id inconnu", () => {
    expect(trouverTerrain("t1")?.nom).toBe("Terrain Les Minguettes");
    expect(trouverTerrain("inconnu")).toBeUndefined();
  });

  it("donne accès à l'état de chaque équipement pour les regrouper", () => {
    const terrain = trouverTerrain("t2");
    const parEtat = new Map<string, number>();
    for (const equipement of terrain?.equipements ?? []) {
      parEtat.set(equipement.etat, (parEtat.get(equipement.etat) ?? 0) + 1);
    }
    expect(parEtat.get("hors_service")).toBe(1);
    expect(parEtat.get("bon")).toBe(1);
  });
});
