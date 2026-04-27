const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false, // ponlo en true en CI
    slowMo: 100
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Ir al login
  await page.goto('http://localhost:4200/login');

  // Esperar a que cargue el input
  await page.waitForSelector('#login-email-input');

  // Login
  await page.fill('#login-email-input', 'Admin1@parkontrol.com');
  await page.fill('#login-password-input', 'Admin1234');

  // Click login (mejor usar locator)
  await Promise.all([
    page.click('#login-admin-text'),
    page.waitForLoadState('networkidle') // mejor que waitForNavigation en SPA
  ]);

  // Ir a tarifas
  await page.click('a[href="/tarifas"]');
  await page.waitForLoadState('networkidle');

  // Nueva tarifa
  await page.click('text=Nueva Tarifa');

  // Esperar formulario
  await page.waitForSelector('input');

  // ⚠️ IMPORTANTE: evita IDs dinámicos
  const inputs = await page.locator('input').all();

  // Asumiendo orden de inputs (mejor poner data-testid en tu front)
  await inputs[0].fill('2000'); // fracción por hora
  await inputs[1].fill('3000'); // hora adicional

  // Selección de parqueadero (más robusto)
  await page.click('.mat-mdc-select-placeholder');
  await page.click('text=Parqueadero Centro');

  // Crear
  await page.click('text=Crear');

  // Esperar algún cambio en UI (tabla, mensaje, etc.)
  await page.waitForTimeout(2000);

  await browser.close();
})();