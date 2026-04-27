const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

setDefaultTimeout(90 * 1000);

const BASE_URL = 'http://localhost:4200';

Before(async function () {
  this.driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless(false))
    .build();
});

After(async function () {
  if (this.driver) {
    await this.driver.quit();
  }
});

async function waitForXPath(driver, xpath, timeout = 15000) {
  const element = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  return driver.wait(until.elementIsVisible(element), timeout);
}

async function clickButtonByText(driver, text) {
  const xpath = `//button[.//span[normalize-space(text())='${text}'] or normalize-space(text())='${text}']`;
  const button = await waitForXPath(driver, xpath);
  await button.click();
  return button;
}

async function fillInputByLabel(driver, label, value) {
  const xpath = `//mat-form-field[.//mat-label[normalize-space(text())='${label}']]//input`;
  const input = await waitForXPath(driver, xpath);
  await input.clear();
  await input.sendKeys(value);
  return input;
}

async function selectMatOption(driver, label, optionText) {
  const selectXpath = `//mat-form-field[.//mat-label[normalize-space(text())='${label}']]//mat-select`;
  const select = await waitForXPath(driver, selectXpath);
  await select.click();
  const optionXpath = `//mat-option//span[normalize-space(text())='${optionText}']`;
  const option = await waitForXPath(driver, optionXpath);
  await option.click();
}

async function assertElementExists(driver, xpath) {
  const element = await driver.findElement(By.xpath(xpath));
  assert.ok(element, `Elemento no encontrado: ${xpath}`);
}

async function navigateTo(driver, path) {
  await driver.get(`${BASE_URL}${path}`);
}

Given('que estoy en la página de login', async function () {
  await navigateTo(this.driver, '/login');
});

Given('que estoy en la página de registro', async function () {
  await navigateTo(this.driver, '/registro');
});

Given('que estoy autenticado como administrador', async function () {
  await navigateTo(this.driver, '/login');
  await fillInputByLabel(this.driver, 'Correo Electrónico', 'test@test.com');
  await fillInputByLabel(this.driver, 'Contraseña', 'test@test.com');
  await clickButtonByText(this.driver, 'Administradores');
  await this.driver.wait(until.urlContains('/dashboard'), 15000);
});

When('ingreso correo {string} y contraseña {string}', async function (correo, contrasena) {
  await fillInputByLabel(this.driver, 'Correo Electrónico', correo);
  await fillInputByLabel(this.driver, 'Contraseña', contrasena);
});

When('selecciono iniciar sesión como cliente', async function () {
  await clickButtonByText(this.driver, 'Clientes');
  await this.driver.wait(until.urlContains('/cliente-dashboard'), 15000);
});

When('ingreso tipo documento {string} número {string} correo {string} y contraseña {string}', async function (tipo, numero, correo, contrasena) {
  await selectMatOption(this.driver, 'Tipo de documento', tipo);
  await fillInputByLabel(this.driver, 'Número de documento', numero);
  await fillInputByLabel(this.driver, 'Correo Electrónico', correo);
  await fillInputByLabel(this.driver, 'Contraseña', contrasena);
});

When('envío el formulario de registro', async function () {
  await clickButtonByText(this.driver, 'Registrarme como Usuario Normal');
});

When('voy a la página de {string}', async function (page) {
  const paths = {
    tarifas: '/tarifas',
    pagos: '/pagos',
    facturación: '/facturacion',
    parqueaderos: '/parqueaderos',
  };
  const path = paths[page.toLowerCase()];
  assert.ok(path, `No existe ruta definida para la página: ${page}`);
  await navigateTo(this.driver, path);
});

When('abro el modal de nueva tarifa', async function () {
  await clickButtonByText(this.driver, 'Nueva Tarifa');
  await assertElementExists(this.driver, `//mat-dialog-container//h1[contains(normalize-space(text()), 'Tarifa')]`);
});

When('abro el modal de creación de parqueadero', async function () {
  await clickButtonByText(this.driver, 'Nuevo Parqueadero');
  await assertElementExists(this.driver, `//mat-dialog-container//h1[contains(normalize-space(text()), 'Parqueadero')]`);
});

When('abro la pestaña {string}', async function (tabName) {
  const tabXpath = `//div[contains(@class, 'mat-tab-label-content') and normalize-space(text())='${tabName}']`;
  const tab = await waitForXPath(this.driver, tabXpath);
  await tab.click();
});

Then('veo el dashboard de cliente', async function () {
  const currentUrl = await this.driver.getCurrentUrl();
  assert.ok(currentUrl.includes('/cliente-dashboard'), `URL esperada cliente-dashboard, encontrada: ${currentUrl}`);
});

Then('veo que la página redirige a login', async function () {
  const currentUrl = await this.driver.getCurrentUrl();
  assert.ok(currentUrl.includes('/login'), `No se redirigió a login, URL actual: ${currentUrl}`);
});

Then('sigo en la página de login con error de credenciales', async function () {
  const currentUrl = await this.driver.getCurrentUrl();
  assert.ok(currentUrl.includes('/login'), `No se mantiene en login, URL actual: ${currentUrl}`);
  await assertElementExists(this.driver, `//div[contains(@class, 'mensaje-error') or contains(text(), 'Datos Incorrectos')]`);
});

Then('veo el botón {string}', async function (buttonText) {
  await assertElementExists(this.driver, `//button[.//span[normalize-space(text())='${buttonText}'] or normalize-space(text())='${buttonText}']`);
});

Then('veo la lista de tarifas', async function () {
  await assertElementExists(this.driver, `//table`);
});

Then('veo la lista de parqueaderos', async function () {
  await assertElementExists(this.driver, `//table`);
});

Then('veo la lista de pagos', async function () {
  await assertElementExists(this.driver, `//table`);
});

Then('veo la pestaña {string}', async function (tabName) {
  await assertElementExists(this.driver, `//div[contains(@class, 'mat-tab-label-content') and normalize-space(text())='${tabName}']`);
});

Then('veo el botón {string}', async function (buttonText) {
  await assertElementExists(this.driver, `//button[.//span[normalize-space(text())='${buttonText}'] or normalize-space(text())='${buttonText}']`);
});
