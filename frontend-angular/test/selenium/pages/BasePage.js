const { By, until } = require("selenium-webdriver");

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async open(path) {
    await this.driver.get(`http://localhost:4200${path}`);
  }

  async waitForUrlContains(value, timeout = 5000) {
    await this.driver.wait(until.urlContains(value), timeout);
  }

  async clickButtonByText(text) {
    const button = await this.driver.findElement(
      By.xpath(`//button[contains(normalize-space(.), '${text}')]`)
    );
    await button.click();
    return button;
  }

  async elementExists(xpath) {
    const elements = await this.driver.findElements(By.xpath(xpath));
    return elements.length > 0;
  }

  async clickByXpath(xpath) {
    const element = await this.driver.findElement(By.xpath(xpath));
    await element.click();
    return element;
  }
}

module.exports = BasePage;
