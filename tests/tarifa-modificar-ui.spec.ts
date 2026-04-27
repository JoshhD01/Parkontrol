const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Ir al login
  await page.goto('http://localhost:4200/login');
  await page.waitForSelector('#login-email-input');

  // Login (sin pasos redundantes)
  await page.fill('#login-email-input', 'Admin1@parkontrol.com');
  await page.fill('#login-password-input', 'Admin1234');

  await Promise.all([
    page.click('#login-admin-content'),
    page.waitForLoadState('networkidle')
  ]);

  // Ir a tarifas
  await page.click('a[href="/tarifas"]');
  await page.waitForLoadState('networkidle');

  // Click botón editar (evitar clases frágiles)
  await page.locator('.accion-btn').first().click();

  // ⚠️ Evitar #mat-input-X → usar locator genérico
  const inputs = page.locator('input');

  // Asumiendo que el input de precio es el primero editable
  await inputs.first().fill('4000');

  // Actualizar
  await page.click('text=Actualizar');

  // Validación básica (esperar que aparezca el valor actualizado)
  await page.waitForSelector('text=$4000');

  // Interacción con tabla
  await page.locator('.mat-mdc-row').first().click();

  await browser.close();
})();