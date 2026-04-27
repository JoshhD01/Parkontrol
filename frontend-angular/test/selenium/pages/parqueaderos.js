const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");

async function loginAsAdmin(driver) {
  await driver.get("http://localhost:4200/login");

  const usuario = await driver.findElement(By.id("mat-input-0"));
  await usuario.clear();
  await usuario.sendKeys("test@test.com");

  const pass = await driver.findElement(By.id("mat-input-1"));
  await pass.clear();
  await pass.sendKeys("test@test.com");

  await driver.findElement(
    By.xpath("//mat-card[.//strong[text()='Administradores']]")
  ).click();

  await driver.wait(until.urlContains("/dashboard"), 5000);
}

describe("Parqueaderos E2E", function () {
  this.timeout(30000);

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

  it("debería cargar la página de parqueaderos y mostrar el botón de creación", async () => {
    await loginAsAdmin(driver);

    await driver.findElement(By.xpath("//span[text()='Parqueaderos']")).click();
    await driver.wait(until.urlContains("/parqueaderos"), 5000);

    const crearParqueaderoButton = await driver.findElement(
      By.xpath(
        "//button[contains(normalize-space(.),'Nuevo Parqueadero') or contains(normalize-space(.),'Crear primer parqueadero')]"
      )
    );

    assert.ok(
      crearParqueaderoButton,
      "No se encontró el botón para crear parqueaderos"
    );

    await crearParqueaderoButton.click();
    await driver.sleep(1000);
  });
});
