const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");
const FacturacionPage = require("../pages/FacturacionPage");
const loginAsAdmin = require("../utilities/adminLogin");

describe("Facturación Page Object", function () {
  this.timeout(30000);

  let driver;
  let facturacionPage;

  before(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(new chrome.Options())
      .build();

    await loginAsAdmin(driver);
    facturacionPage = new FacturacionPage(driver);
    await facturacionPage.open();
  });

  after(async () => {
    await driver.quit();
  });

  it("debería exponer los métodos de listado en facturación", async () => {
    const hasClientes = await facturacionPage.hasClientesTab();
    const hasFacturas = await facturacionPage.hasFacturasTab();

    assert.ok(hasClientes, "No se encontró la pestaña Clientes");
    assert.ok(hasFacturas, "No se encontró la pestaña Facturas");
  });

  it("debería abrir la pestaña de facturas y mostrar el botón de nueva factura", async () => {
    await facturacionPage.openFacturasTab();
    const hasNewFacturaButton = await facturacionPage.hasNewFacturaButton();

    assert.ok(
      hasNewFacturaButton,
      "El método hasNewFacturaButton no encontró el botón de nueva factura"
    );
  });
});
