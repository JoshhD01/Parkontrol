const BasePage = require("./BasePage");

class FacturacionPage extends BasePage {
  async open() {
    await super.open("/facturacion");
    await this.waitForUrlContains("/facturacion");
  }

  async hasClientesTab() {
    return this.elementExists("//span[text()='Clientes']");
  }

  async hasFacturasTab() {
    return this.elementExists("//span[text()='Facturas']");
  }

  async openFacturasTab() {
    return this.clickByXpath("//span[text()='Facturas']");
  }

  async hasNewFacturaButton() {
    return this.elementExists(
      "//button[contains(normalize-space(.),'Nueva Factura')]"
    );
  }
}

module.exports = FacturacionPage;
