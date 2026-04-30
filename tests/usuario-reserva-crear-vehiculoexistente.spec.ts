import { expect, test } from '@playwright/test';
import { loginAsUser } from './helpers/auth';

test.describe('Usuario reserva - vehículo existente', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.getByRole('link', { name: /Reservas/i }).click();
    await expect(page).toHaveURL(/\/reservas/);
  });

  test('1) crea reserva con vehículo existente', async ({ page }) => {
    await page.getByRole('button', { name: /Nueva Reserva/i }).click();
    await page.locator('#mat-input-30').selectOption('17');
    await page.locator('#mat-input-28').fill('2026-05-04T14:00');
    await page.locator('#mat-input-27').selectOption('8');
    await page.getByRole('button', { name: /Crear Reserva/i }).click();
    await expect(page.locator('text=Activa')).toBeVisible();
  });

  test('2) no permite reserva con fecha de fin anterior a fecha de inicio', async ({ page }) => {
    await page.getByRole('button', { name: /Nueva Reserva/i }).click();
    await page.locator('#mat-input-30').selectOption('17');
    await page.locator('#mat-input-28').fill('2026-05-05T14:00');
    await page.locator('#mat-input-27').selectOption('8');
    await page.locator('#mat-input-29').fill('2026-05-04T14:00').catch(() => {});
    await page.getByRole('button', { name: /Crear Reserva/i }).click();
    await expect(page.locator('text=La fecha de fin debe ser posterior|Fecha inválida|Error')).toBeVisible();
  });
});
