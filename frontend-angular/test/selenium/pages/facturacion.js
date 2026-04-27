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

describe("Facturación E2E", function () {
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

  it("debería cargar facturación y mostrar la pestaña de facturas", async () => {
    await loginAsAdmin(driver);

    await driver.findElement(By.xpath("//span[text()='Facturacion']")).click();
    await driver.wait(until.urlContains("/facturacion"), 5000);

    const clientesTab = await driver.findElement(
      By.xpath("//span[text()='Clientes']")
    );
    const facturasTab = await driver.findElement(
      By.xpath("//span[text()='Facturas']")
    );

    assert.ok(clientesTab, "No se encontró la pestaña 'Clientes'");
    assert.ok(facturasTab, "No se encontró la pestaña 'Facturas'");

    await facturasTab.click();
    await driver.sleep(1000);

    const nuevaFacturaButton = await driver.findElement(
      By.xpath("//button[contains(normalize-space(.),'Nueva Factura')]")
    );

    assert.ok(
      nuevaFacturaButton,
      "No se encontró el botón 'Nueva Factura' en la sección de Facturas"
    );
  });
});
