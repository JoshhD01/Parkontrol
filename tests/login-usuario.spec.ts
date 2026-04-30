import { expect, test } from '@playwright/test';
import { loginAsUser } from './helpers/auth';

test.describe('Login usuario', () => {
  test('1) inicia sesión como usuario correctamente', async ({ page }) => {
    await loginAsUser(page);
    await expect(page.locator('.contenedor-cliente')).toBeVisible();
  });

  test('2) no inicia sesión con correo inválido', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[formcontrolname="correo"]').fill('invalid@parkontrol.com');
    await page.locator('input[formcontrolname="contrasena"]').fill('user1234');
    const loginButton = page.locator('#login-submit-btn > .mat-mdc-button-touch-target');
    await Promise.all([
      loginButton.click(),
      page.waitForURL(/\/login/, { timeout: 5000 }),
    ]);
    await expect(page).toHaveURL(/\/login/);
  });

  test('3) no permite iniciar sesión sin contraseña', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[formcontrolname="correo"]').fill('user4@parkontrol.com');
    const loginButton = page.locator('#login-submit-btn > .mat-mdc-button-touch-target');
    await expect(loginButton).toBeDisabled();
  });
});
