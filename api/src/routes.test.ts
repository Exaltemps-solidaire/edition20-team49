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
  it("refuse une déclaration sans urgence ni nom de terrain", () => {
    const reponse = router("POST", "/api/v1/incidents", JSON.stringify({ ville: "Lyon" }));
    expect(reponse.statut).toBe(400);

    const reponseSansUrgence = router(
      "POST",
      "/api/v1/incidents",
      JSON.stringify({ terrainNom: "Terrain improvisé" }),
    );
    expect(reponseSansUrgence.statut).toBe(400);
  });

  it("crée l'incident avec un terrain saisi librement, visible dans la liste globale", () => {
    const creation = router(
      "POST",
      "/api/v1/incidents",
      JSON.stringify({
        terrainNom: "Terrain improvisé",
        ville: "Lyon",
        codePostal: "69001",
        adresse: "12 rue du Stade",
        description: "Filet déchiré",
        urgence: "moderee",
      }),
    );
    expect(creation.statut).toBe(201);

    const liste = router("GET", "/api/v1/incidents");
    const incidents = liste.corps as Array<{ id: string; terrainNom: string; etat: string }>;
    const incident = incidents.find((i) => i.id === (creation.corps as { id: string }).id);
    expect(incident?.terrainNom).toBe("Terrain improvisé");
    expect(incident?.etat).toBe("nouveau");
  });
});

describe("PATCH /api/v1/incidents/:id", () => {
  it("refuse l'affectation sans prestataire", () => {
    const creation = router(
      "POST",
      "/api/v1/incidents",
      JSON.stringify({ terrainNom: "Terrain Les Minguettes", urgence: "haute" }),
    );
    const incident = creation.corps as { id: string };

    const reponse = router(
      "PATCH",
      `/api/v1/incidents/${incident.id}`,
      JSON.stringify({ dateIntervention: "2026-11-20" }),
    );
    expect(reponse.statut).toBe(400);
  });

  it("affecte un prestataire sans date d'intervention puis marque l'incident résolu", () => {
    const creation = router(
      "POST",
      "/api/v1/incidents",
      JSON.stringify({ terrainNom: "Terrain Les Minguettes", urgence: "haute" }),
    );
    const incident = creation.corps as { id: string };

    const affectation = router(
      "PATCH",
      `/api/v1/incidents/${incident.id}`,
      JSON.stringify({ prestataire: "Acme" }),
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
