import { expect, type Page } from '@playwright/test';

export const ADMIN_EMAIL = 'admin1@parkontrol.com';
export const ADMIN_PASSWORD = 'Admin1234';
export const OPERATOR_EMAIL = 'Oper1@parkontrol.com';
export const OPERATOR_PASSWORD = 'Oper1234';
export const USER_EMAIL = 'user4@parkontrol.com';
export const USER_PASSWORD = 'user1234';

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('input[formcontrolname="correo"]').fill(ADMIN_EMAIL);
  await page.locator('input[formcontrolname="contrasena"]').fill(ADMIN_PASSWORD);

  await page.locator('#login-admin-card').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function loginAsOperator(page: Page): Promise<void> {
  await page.goto('/login');

  await page.locator('input[formcontrolname="correo"]').fill(OPERATOR_EMAIL);
  await page.locator('input[formcontrolname="contrasena"]').fill(OPERATOR_PASSWORD);

  await page.locator('#login-operator-card').click();
  await expect(page).toHaveURL(/\/operador-dashboard$/);
}

export async function loginAsUser(page: Page): Promise<void> {
  await page.goto('/login');

  await page.locator('input[formcontrolname="correo"]').fill(USER_EMAIL);
  await page.locator('input[formcontrolname="contrasena"]').fill(USER_PASSWORD);

  await page.locator('#login-submit-btn').click();
  await expect(page.locator('.contenedor-cliente')).toBeVisible();
}
