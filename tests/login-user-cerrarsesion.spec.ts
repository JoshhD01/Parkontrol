import { expect, test } from '@playwright/test';
import { loginAsUser } from './helpers/auth';

test.describe('Login usuario y cerrar sesión', () => {
  test('1) inicia sesión como usuario y cierra sesión', async ({ page }) => {
    await loginAsUser(page);
    const logoutButton = page.getByRole('button', { name: /Cerrar sesión/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('2) no muestra opción de cerrar sesión antes de iniciar sesión', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Cerrar sesión/i })).toHaveCount(0);
  });

  test('3) no inicia sesión sin contraseña', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[formcontrolname="correo"]').fill('user4@parkontrol.com');
    const loginButton = page.locator('#login-submit-btn > .mat-mdc-button-touch-target');
    await expect(loginButton).toBeDisabled();
  });
});
