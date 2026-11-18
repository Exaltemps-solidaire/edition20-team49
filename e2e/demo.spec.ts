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
});
