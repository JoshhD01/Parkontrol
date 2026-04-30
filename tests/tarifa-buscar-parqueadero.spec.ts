import { expect, test } from '@playwright/test';
import { loginAsUser } from './helpers/auth';

test.describe('Tarifa - buscar parqueadero', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.getByRole('link', { name: /Tarifas/i }).click();
    await expect(page).toHaveURL(/\/tarifas/);
  });

  test('1) busca tarifas por modo de vehículo y placa', async ({ page }) => {
    const modoVehiculo = page.locator('label:nth-child(2) > [name="modoVehiculo"]');
    await modoVehiculo.click();
    const placaInput = page.locator('#mat-input-22');
    await placaInput.fill('rrt123');
    await placaInput.blur();
    await expect(page.locator('text=rrt123')).toBeVisible();
  });

  test('2) muestra error cuando la placa está vacía', async ({ page }) => {
    const placaInput = page.locator('#mat-input-22');
    await placaInput.fill('');
    await placaInput.blur();
    await expect(page.getByText(/(Este campo es obligatorio|La placa es requerida|Ingrese una placa)/i)).toBeVisible();
  });
});
