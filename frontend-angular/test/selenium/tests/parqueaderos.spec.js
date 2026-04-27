const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");
const ParqueaderosPage = require("../pages/ParqueaderosPage");
const loginAsAdmin = require("../utilities/adminLogin");

describe("Parqueaderos Page Object", function () {
  this.timeout(30000);

  let driver;
  let parqueaderosPage;

  before(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(new chrome.Options())
      .build();

    await loginAsAdmin(driver);
    parqueaderosPage = new ParqueaderosPage(driver);
    await parqueaderosPage.open();
  });

  after(async () => {
    await driver.quit();
  });

  it("debería exponer el método de creación de parqueaderos", async () => {
    const hasCreate = await parqueaderosPage.hasCreateButton();
    assert.ok(hasCreate, "El método hasCreateButton no encontró el botón de nuevo parqueadero");
  });

  it("debería abrir el modal de creación de parqueadero", async () => {
    await parqueaderosPage.openCreateModal();
    const modalVisible = await parqueaderosPage.elementExists("//mat-dialog-container");
    assert.ok(modalVisible, "El modal de crear parqueadero no se abrió correctamente");
  });
});
