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

describe("POST /api/v1/incidents", () => {
  it("refuse une déclaration sans urgence ni équipement valide", () => {
    const reponse = router("POST", "/api/v1/incidents", JSON.stringify({ lieu: "Angle nord" }));
    expect(reponse.statut).toBe(400);

    const reponseEquipementInconnu = router(
      "POST",
      "/api/v1/incidents",
      JSON.stringify({ equipementId: "inconnu", urgence: "haute" }),
    );
    expect(reponseEquipementInconnu.statut).toBe(400);
  });

  it("rattache l'incident créé à l'équipement visé, visible sur la fiche du terrain", () => {
    const creation = router(
      "POST",
      "/api/v1/incidents",
      JSON.stringify({
        equipementId: "t1-e1",
        lieu: "Angle nord",
        description: "Filet déchiré",
        urgence: "moderee",
      }),
    );
    expect(creation.statut).toBe(201);

    const fiche = router("GET", "/api/v1/terrains/t1");
    const terrain = fiche.corps as { equipements: Array<{ id: string; incidents: Array<{ etat: string }> }> };
    const equipement = terrain.equipements.find((e) => e.id === "t1-e1");
    expect(equipement?.incidents).toHaveLength(1);
    expect(equipement?.incidents[0].etat).toBe("nouveau");
  });
});

describe("PATCH /api/v1/incidents/:id", () => {
  it("refuse l'affectation d'un prestataire sans ETA", () => {
    const creation = router(
      "POST",
      "/api/v1/incidents",
      JSON.stringify({ equipementId: "t2-e1", urgence: "haute" }),
    );
    const incident = creation.corps as { id: string };

    const reponse = router(
      "PATCH",
      `/api/v1/incidents/${incident.id}`,
      JSON.stringify({ prestataire: "Acme" }),
    );
    expect(reponse.statut).toBe(400);
  });

  it("affecte un prestataire puis marque l'incident résolu", () => {
    const creation = router(
      "POST",
      "/api/v1/incidents",
      JSON.stringify({ equipementId: "t2-e1", urgence: "haute" }),
    );
    const incident = creation.corps as { id: string };

    const affectation = router(
      "PATCH",
      `/api/v1/incidents/${incident.id}`,
      JSON.stringify({ prestataire: "Acme", eta: "2026-11-20" }),
    );
    expect(affectation.statut).toBe(200);
    expect((affectation.corps as { etat: string }).etat).toBe("en_cours");

    const resolution = router(
      "PATCH",
      `/api/v1/incidents/${incident.id}`,
      JSON.stringify({ etat: "resolu" }),
    );
    expect(resolution.statut).toBe(200);
    expect((resolution.corps as { etat: string }).etat).toBe("resolu");
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
