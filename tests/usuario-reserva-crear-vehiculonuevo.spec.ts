import { expect, test } from '@playwright/test';
import { loginAsUser } from './helpers/auth';

test.describe('Usuario reserva - vehículo nuevo', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.getByRole('link', { name: /Reservas/i }).click();
    await expect(page).toHaveURL(/\/reservas/);
  });

  test('1) crea reserva con vehículo nuevo', async ({ page }) => {
    await page.getByRole('button', { name: /Nueva Reserva/i }).click();
    await page.locator('#mat-input-22').fill('RTX123');
    await page.locator('#mat-input-19').fill('2026-05-03T09:00');
    await page.locator('#mat-input-16').fill('2026-05-03T18:00');
    await page.locator('#mat-input-18').selectOption('10');
    await page.getByRole('button', { name: /Crear Reserva/i }).click();
    await expect(page.locator('text=Activa')).toBeVisible();
  });

  test('2) no permite reserva con placa vacía', async ({ page }) => {
    await page.getByRole('button', { name: /Nueva Reserva/i }).click();
    await page.locator('#mat-input-22').fill('');
    await page.locator('#mat-input-19').fill('2026-05-03T09:00');
    await page.locator('#mat-input-16').fill('2026-05-03T18:00');
    await expect(page.getByRole('button', { name: /Crear Reserva/i })).toBeDisabled();
  });
});
