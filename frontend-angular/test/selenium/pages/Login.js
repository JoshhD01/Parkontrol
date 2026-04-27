const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");

describe("Login E2E", function () {
  this.timeout(20000);

  let driver;

  before(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(new chrome.Options())
      .build();
  });

  after(async () => {
    await driver.quit();
  });

  // helper
  async function getElement(selector) {
    const el = await driver.wait(until.elementLocated(selector), 5000);
    await driver.wait(until.elementIsVisible(el), 5000);
    return el;
  }

  it("debería iniciar sesión correctamente", async () => {
    await driver.get("http://localhost:4200/login");

    const usuario = await getElement(By.id("login-email-input"));
    await usuario.clear();
    await usuario.sendKeys("Admin1@parkontrol.com");

    const pass = await getElement(By.id("login-password-input"));
    await pass.clear();
    await pass.sendKeys("Admin1234");

    // 👇 tarjeta admin
    const cardAdmin = await getElement(By.id("login-admin-card"));

    // 🔥 click forzado (evita problemas de Angular/form)
    await driver.executeScript("arguments[0].click();", cardAdmin);

    // 👇 validar navegación
    await driver.wait(until.urlContains("dashboard"), 5000);

    const newUrl = await driver.getCurrentUrl();

    assert.ok(
      newUrl.includes("dashboard"),
      "❌ No entró a la vista de administradores"
    );
  });
});