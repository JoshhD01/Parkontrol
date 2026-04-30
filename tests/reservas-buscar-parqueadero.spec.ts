import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

async function openReservas(page: Page): Promise<void> {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Reservas/i }).click();
  await expect(page).toHaveURL(/\/reservas/);
}

test.describe('Reservas - buscar parqueadero', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await openReservas(page);
  });

  test('1) muestra filtro de parqueadero en la pantalla de reservas', async ({ page }: { page: Page }) => {
    await expect(page.getByLabel(/Seleccionar parqueadero/i)).toBeVisible();
  });

  test('2) no muestra tabla de reservas antes de seleccionar parqueadero', async ({ page }: { page: Page }) => {
    await expect(page.locator('.table-container')).toHaveCount(0);
  });

  test('3) filtra reservas por parqueadero Centro', async ({ page }: { page: Page }) => {
    await page.getByLabel(/Seleccionar parqueadero/i).click();
    await page.getByRole('option', { name: /Parqueadero Centro/i }).click();

    await expect(page.getByRole('button', { name: /Parqueadero Centro/i })).toBeVisible();
    await expect(page.locator('.table-container')).toBeVisible();
  });
});
