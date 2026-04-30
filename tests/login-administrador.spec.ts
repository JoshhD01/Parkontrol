import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Login administrador', () => {
  test('1) inicia sesión como administrador', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/(dashboard|home|reservas|pagos)/);
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
  });

  test('2) no inicia sesión con contraseña incorrecta', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[formcontrolname="correo"]').fill('admin1@parkontrol.com');
    await page.locator('input[formcontrolname="contrasena"]').fill('WrongPassword1!');
    const loginButton = page.locator('#login-submit-btn > .mat-mdc-button-touch-target');
    await Promise.all([
      loginButton.click(),
      page.waitForURL(/\/login/, { timeout: 5000 }),
    ]);
    await expect(page).toHaveURL(/\/login/);
  });

  test('3) no permite iniciar sesión sin correo', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[formcontrolname="contrasena"]').fill('Admin1234');
    const loginButton = page.locator('#login-submit-btn > .mat-mdc-button-touch-target');
    await expect(loginButton).toBeDisabled();
  });
});
