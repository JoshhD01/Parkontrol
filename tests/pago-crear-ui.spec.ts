const playwright = require('playwright');
(async () => {
  const browser = await playwright['chromium'].launch({
    // headless: false, slowMo: 100, // Uncomment to visualize test
  });
  const page = await browser.newPage();

  // Load "http://localhost:4200/login"
  await page.goto('http://localhost:4200/login');

  // Resize window to 1854 x 963
  await page.setViewportSize({ width: 1854, height: 963 });

  // Click on <mat-label> "Correo Electronico"
  await page.click('#login-email-label');

  // Fill "Admin1@parkontrol.com" on <input> #login-email-input
  await page.fill('#login-email-input', 'Admin1@parkontrol.com');

  // Click on <div> "account_circle ParkContro..."
  await page.click('#login-container');

  // Click on <mat-label> "Contraseña"
  await page.click('#login-password-label');

  // Fill "Admin1234" on <input> #login-password-input
  await page.fill('#login-password-input', 'Admin1234');

  // Click on <mat-icon> "admin_panel_settings"
  await Promise.all([
    page.click('#login-admin-icon'),
    page.waitForNavigation()
  ]);

  // Click on <a> "payment Pagos"
  await Promise.all([
    page.click('[href="/pagos"]'),
    page.waitForNavigation()
  ]);

  // Click on <span> "Nuevo Pago"
  await page.click('text=Nuevo Pago');

  // Click on <span> .mat-mdc-select-placeholder
  await page.click('.mat-mdc-select-placeholder');

  // Click on <svg> #mat-select-8 svg
  await page.click('#mat-select-8 svg');

  // Click on <mat-label> "Seleccionar Reserva Abier..."
  await page.click('#mat-mdc-form-field-label-21 > mat-label');

  // Click on <span> .mat-mdc-select-placeholder
  await page.click('.mat-mdc-select-placeholder');

  // Click on <span> .mat-mdc-button > .mat-mdc-button-touch-target
  await page.click('.mat-mdc-button > .mat-mdc-button-touch-target');

  // Click on <a> "event Reservas"
  await Promise.all([
    page.click('[href="/reservas"]'),
    page.waitForNavigation()
  ]);

  // Click on <span> "Nueva Reserva"
  await page.click('text=Nueva Reserva');

  // Fill "OJD443" on <input> #mat-input-13
  await page.fill('#mat-input-13', 'OJD443');

  // Click on <span> #mat-select-value-10 > .mat-mdc-select-placeholder
  await page.click('#mat-select-value-10 > .mat-mdc-select-placeholder');

  // Click on <mat-option> "Celda #6 - Tipo: PARTICUL..."
  await page.click('#mat-option-84');

  // Click on <input> #mat-input-15
  await page.click('#mat-input-15');

  // Click on <input> #mat-input-16
  await page.click('#mat-input-16');

  // Scroll wheel by X:0, Y:612
  await page.mouse.wheel(0, 612);

  // Click on <span> .mat-mdc-select-placeholder
  await page.click('.mat-mdc-select-placeholder');

  // Click on <mat-option> "CC - a@a.com"
  await page.click('#mat-option-162');

  // Scroll wheel by X:0, Y:690
  await page.mouse.wheel(0, 690);

  // Scroll wheel by X:0, Y:-612
  await page.mouse.wheel(0, -612);

  // Click on <input> #mat-input-15
  await page.click('#mat-input-15');

  // Fill "2026-04-27T12:30" on <input> #mat-input-15
  await page.fill('#mat-input-15', '2026-04-27T12:30');

  // Click on <input> #mat-input-16
  await page.click('#mat-input-16');

  // Scroll wheel by X:0, Y:612
  await page.mouse.wheel(0, 612);

  // Press Enter on input
  await page.press('#mat-input-16', 'Enter');

  // Fill "2026-04-28T11:00" on <input> #mat-input-16
  await page.fill('#mat-input-16', '2026-04-28T11:00');

  // Click on <form> "Placa del Vehículo Si la ..."
  await page.click('.mat-mdc-dialog-content > .ng-dirty');

  // Click on <span> "Crear Reserva"
  await page.click('text=Crear Reserva');

  // Click on <a> "payment Pagos"
  await Promise.all([
    page.click('[href="/pagos"]'),
    page.waitForNavigation()
  ]);

  // Click on <span> "Nuevo Pago"
  await page.click('text=Nuevo Pago');

  // Click on <span> .mat-mdc-select-placeholder
  await page.click('.mat-mdc-select-placeholder');

  // Click on <svg> #mat-select-14 svg
  await page.click('#mat-select-14 svg');

  // Click on <span> "Reserva 28 del Vehiculo: ..."
  await page.click('.mdc-list-item__primary-text');

  // Click on <input> #mat-input-17
  await page.click('#mat-input-17');

  // Click on <input> #mat-input-17
  await page.click('#mat-input-17');

  // Fill "1" on <input> #mat-input-17
  await page.fill('#mat-input-17', '1');

  // Click on <span> "Procesar Pago"
  await page.click('text=Procesar Pago');

  // Scroll wheel by X:0, Y:918
  await page.mouse.wheel(0, 918);

  // Scroll wheel by X:0, Y:-612
  await page.mouse.wheel(0, -612);

  await browser.close();
})();