const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");
const PagosPage = require("../pages/PagosPage");
const loginAsAdmin = require("../utilities/adminLogin");

describe("Pagos Page Object", function () {
  this.timeout(30000);

  let driver;
  let pagosPage;

  before(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(new chrome.Options())
      .build();

    await loginAsAdmin(driver);
    pagosPage = new PagosPage(driver);
    await pagosPage.open();
  });

  after(async () => {
    await driver.quit();
  });

  it("debería exponer el método para crear pagos", async () => {
    const hasCreate = await pagosPage.hasCreateButton();
    assert.ok(hasCreate, "El método hasCreateButton no encontró el botón de nuevo pago");
  });

  it("debería abrir el modal de nuevo pago", async () => {
    await pagosPage.openCreateModal();
    const modalVisible = await pagosPage.elementExists("//mat-dialog-container");
    assert.ok(modalVisible, "El modal de crear pago no se abrió correctamente");
  });
});
