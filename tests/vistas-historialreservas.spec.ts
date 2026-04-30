import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

async function openVistas(page: Page): Promise<void> {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Vistas/i }).click();
  await expect(page).toHaveURL(/\/vistas/);
}

test.describe('Vistas - historial de reservas', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await openVistas(page);
  });

  test('1) muestra la pestaña Historial de Reservas', async ({ page }: { page: Page }) => {
    await expect(page.getByRole('tab', { name: /Historial de Reservas/i })).toBeVisible();
  });

  test('2) al seleccionar Historial de Reservas carga el contenido', async ({ page }: { page: Page }) => {
    await page.getByRole('tab', { name: /Historial de Reservas/i }).click();
    const table = page.locator('table.historial-table');

    if (await table.count() > 0) {
      await expect(table).toBeVisible();
    } else {
      await expect(page.getByText(/No se encontraron reservas para mostrar/i)).toBeVisible();
    }
  });

  test('3) muestra total de reservas en el panel de estadisticas', async ({ page }: { page: Page }) => {
    const totalReservasCard = page.locator('.estadistica-card').filter({ hasText: /Total Reservas/i }).first();
    await expect(totalReservasCard).toBeVisible();
    await expect(totalReservasCard.locator('.estadistica-valor')).toHaveText(/\d+/);
  });
});
