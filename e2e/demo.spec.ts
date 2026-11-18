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
    await page.getByLabel("Niveau d'urgence").selectOption("moderee");
    await page.getByRole("button", { name: "Envoyer" }).click();
    await expect(page.getByText("Filet déchiré")).toBeVisible();
  });
});
