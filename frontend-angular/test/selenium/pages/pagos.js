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

describe("Pagos E2E", function () {
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

  it("debería abrir la sección de pagos y mostrar el botón de nuevo pago", async () => {
    await loginAsAdmin(driver);

    await driver.findElement(By.xpath("//span[text()='Pagos']")).click();
    await driver.wait(until.urlContains("/pagos"), 5000);

    const nuevoPagoButton = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.),'Nuevo Pago')]")
    );

    assert.ok(
      nuevoPagoButton,
      "No se encontró el botón 'Nuevo Pago' en la página de Pagos"
    );

    await nuevoPagoButton.click();
    await driver.sleep(1000);
  });
});
