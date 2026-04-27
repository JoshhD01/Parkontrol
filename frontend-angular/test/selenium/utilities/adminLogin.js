const { By, until } = require("selenium-webdriver");

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

module.exports = loginAsAdmin;
