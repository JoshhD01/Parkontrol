import { expect, type Page } from '@playwright/test';

export const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL ?? 'admin1@parkontrol.com';
export const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD ?? 'Admin1234';

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');

  await page.locator('input[formcontrolname="correo"]').fill(ADMIN_EMAIL);
  await page.locator('input[formcontrolname="contrasena"]').fill(ADMIN_PASSWORD);

  await page.locator('.tarjeta-info-clickable').first().click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
