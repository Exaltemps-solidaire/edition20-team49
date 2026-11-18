import { expect, test } from "@playwright/test";

// Démo du cas passant, de bout en bout. Chaque itération ajoute ses étapes (test.step).
test("Démo : le cas passant", async ({ page }) => {
  await test.step("J'ouvre l'application", async () => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  await test.step("Je vois la liste des terrains", async () => {
    await expect(page.getByRole("link", { name: /Terrain Les Minguettes/ })).toBeVisible();
  });

  await test.step("J'ouvre la fiche d'un terrain", async () => {
    await page.getByRole("link", { name: /Terrain Les Minguettes/ }).click();
    await expect(page.getByRole("heading", { name: /Terrain Les Minguettes/ })).toBeVisible();
    await expect(page.getByText("But côté nord")).toBeVisible();
  });

  await test.step("Je choisis le persona RST", async () => {
    await page.getByRole("link", { name: "Qui êtes-vous ?" }).click();
    await page.getByRole("button", { name: /Responsable sportif territorial/ }).click();
    await expect(page.getByText(/Responsable sportif territorial/)).toBeVisible();
  });

  await test.step("Je déclare un incident sur un équipement", async () => {
    await page.getByRole("link", { name: /Terrain Les Minguettes/ }).click();
    await page.getByRole("button", { name: "Déclarer un incident" }).first().click();
    await page.getByLabel("Lieu précis").fill("Angle nord");
    await page.getByLabel("Description").fill("Filet déchiré");
    await page.getByLabel("Niveau d'urgence").click();
    await page.getByRole("option", { name: "Modérée" }).click();
    await page.getByRole("button", { name: "Envoyer" }).click();
    await expect(page.getByText("Filet déchiré")).toBeVisible();
  });

  await test.step("Je passe directeur et j'ouvre le tableau de bord", async () => {
    await page.getByRole("link", { name: "changer" }).click();
    await page.getByRole("button", { name: /Directeur national des infrastructures/ }).click();
    await page.getByRole("link", { name: "tableau de bord" }).click();
    await expect(page.getByRole("heading", { name: "Tableau de bord des incidents" })).toBeVisible();
    await expect(page.getByText("Filet déchiré")).toBeVisible();
  });

  await test.step("J'affecte un prestataire à l'incident", async () => {
    await page.getByRole("button", { name: "Affecter un prestataire" }).click();
    await page.getByLabel("Prestataire").fill("Acme Réparations");
    await page.getByLabel("ETA").fill("2026-11-20");
    await page.getByRole("button", { name: "Affecter" }).click();
    await expect(page.getByText(/Prestataire : Acme Réparations/)).toBeVisible();
  });

  await test.step("Je marque l'incident résolu", async () => {
    await page.getByRole("button", { name: "Marquer résolu" }).click();
    await expect(page.getByText(/Prestataire : Acme Réparations/)).toBeVisible();
  });
});
