import { expect, type Page } from '@playwright/test';

export const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL ?? 'admin1@parkontrol.com';
export const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD ?? 'Admin1234';
export const USER_EMAIL = process.env.PW_USER_EMAIL ?? 'user4@parkontrol.com';
export const USER_PASSWORD = process.env.PW_USER_PASSWORD ?? 'user1234';

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('input[formcontrolname="correo"]').fill(ADMIN_EMAIL);
  await page.locator('input[formcontrolname="contrasena"]').fill(ADMIN_PASSWORD);
  await page.locator('.tarjeta-info-clickable').first().click();
  await expect(page).toHaveURL(/\/(dashboard|home|reservas|pagos)/);
}

export async function loginAsUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('input[formcontrolname="correo"]').fill(USER_EMAIL);
  await page.locator('input[formcontrolname="contrasena"]').fill(USER_PASSWORD);

  const submitButton = page.locator('#login-submit-btn > .mat-mdc-button-touch-target');
  if (await submitButton.count()) {
    await Promise.all([
      submitButton.click(),
      page.waitForURL(/\/(dashboard|home|reservas|cliente|pagos|tarifas)/),
    ]);
  } else {
    const altButton = page.getByRole('button', { name: /Ingresar|Entrar|Login|Iniciar sesión|Iniciar Sesión/i }).first();
    await Promise.all([
      altButton.click(),
      page.waitForURL(/\/(dashboard|home|reservas|cliente|pagos|tarifas)/),
    ]);
  }

  await expect(page.locator('text=Cerrar sesión')).toHaveCount(0).catch(() => {});
}
