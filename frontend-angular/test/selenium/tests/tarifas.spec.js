const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");
const TarifasPage = require("../pages/TarifasPage");
const loginAsAdmin = require("../utilities/adminLogin");

describe("Tarifas Page Object", function () {
  this.timeout(30000);

  let driver;
  let tarifasPage;

  before(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(new chrome.Options())
      .build();

    await loginAsAdmin(driver);
    tarifasPage = new TarifasPage(driver);
    await tarifasPage.open();
  });

  after(async () => {
    await driver.quit();
  });

  it("debería exponer el método de creación de tarifas", async () => {
    const hasCreate = await tarifasPage.hasCreateButton();
    assert.ok(hasCreate, "El método hasCreateButton no encontró el botón de nueva tarifa");
  });

  it("debería abrir el modal de creación de tarifa", async () => {
    await tarifasPage.openCreateModal();
    const modalVisible = await tarifasPage.elementExists("//mat-dialog-container");
    assert.ok(modalVisible, "El modal de crear tarifa no se abrió correctamente");
  });
});
