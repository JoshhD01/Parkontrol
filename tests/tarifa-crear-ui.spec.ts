import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

async function openTarifas(page: Page): Promise<void> {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Tarifas/i }).click();
  await expect(page).toHaveURL(/\/tarifas/);
}

async function openNuevaTarifa(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Nueva Tarifa/i }).click();
  await expect(page.locator('mat-dialog-container')).toBeVisible();
}

test.describe('Tarifa - UI creación', () => {
  test.beforeEach(async ({ page }) => {
    await openTarifas(page);
    await openNuevaTarifa(page);
  });

  test('1) crea tarifa con valores válidos', async ({ page }) => {
    const inputs = page.locator('mat-dialog-container input[type="number"]');
    await inputs.nth(0).fill('2000');
    await inputs.nth(1).fill('3000');
    await page.locator('.mat-mdc-select-placeholder').first().click();
    await page.locator('mat-option').first().click();
    await page.getByRole('button', { name: /Crear/i }).click();
    await expect(page.locator('.mensaje-exito')).toBeVisible();
  });

  test('2) no permite crear tarifa sin valores', async ({ page }) => {
    const creaButton = page.getByRole('button', { name: /Crear/i }).first();
    await expect(creaButton).toBeDisabled();
  });

  test('3) no permite crear tarifa con precio negativo', async ({ page }) => {
    const inputs = page.locator('mat-dialog-container input[type="number"]');
    await inputs.nth(0).fill('-100');
    await inputs.nth(1).fill('3000');
    await page.locator('.mat-mdc-select-placeholder').first().click();
    await page.locator('mat-option').first().click();
    await expect(page.getByRole('button', { name: /Crear/i }).first()).toBeDisabled();
  });
});
