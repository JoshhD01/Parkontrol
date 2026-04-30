import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Tarifa - modificación UI', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Tarifas/i }).click();
    await expect(page).toHaveURL(/\/tarifas/);
  });

  test('1) modifica tarifa existente correctamente', async ({ page }) => {
    await page.locator('.accion-btn').first().click();
    const inputs = page.locator('input[type="number"]');
    await inputs.first().fill('4000');
    await page.getByRole('button', { name: /Actualizar|Guardar/i }).click();
    await expect(page.locator('.mensaje-exito')).toBeVisible();
  });

  test('2) no permite guardar tarifa con valor inválido', async ({ page }) => {
    await page.locator('.accion-btn').first().click();
    const inputs = page.locator('input[type="number"]');
    await inputs.first().fill('-1');
    await inputs.first().blur();
    await expect(page.getByRole('button', { name: /Actualizar|Guardar/i }).first()).toBeDisabled();
  });
});
