const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");

describe("Registro E2E", function () {
  this.timeout(20000); // ⏱ importante (Selenium es lento)

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

  it("debería registrar un usuario correctamente", async () => {
    await driver.get("http://localhost:4200/registro");

    const identificacion = await driver.findElement(By.id("mat-input-5"));
    await identificacion.sendKeys("123456789");

    const correo = await driver.findElement(By.id("mat-input-6"));
    await correo.sendKeys("test@test.com");

    const pass = await driver.findElement(By.id("mat-input-7"));
    await pass.sendKeys("test@test.com");

    const button = await driver.findElement(
      By.xpath("//button[.//span[text()='Registrarme como Usuario Normal']]")
    );

    const oldUrl = await driver.getCurrentUrl();
    await button.click();

    // ✅ validar cambio de URL
    await driver.wait(async () => {
      return (await driver.getCurrentUrl()) !== oldUrl;
    }, 5000);

    const newUrl = await driver.getCurrentUrl();

    // 🔥 assert real
    assert.ok(newUrl.includes("/login"), "No redirigió al login");
  });
});