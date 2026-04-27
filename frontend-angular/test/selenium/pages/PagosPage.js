const BasePage = require("./BasePage");

class PagosPage extends BasePage {
  async open() {
    await super.open("/pagos");
    await this.waitForUrlContains("/pagos");
  }

  async hasCreateButton() {
    return this.elementExists(
      "//button[contains(normalize-space(.),'Nuevo Pago')]"
    );
  }

  async openCreateModal() {
    return this.clickButtonByText("Nuevo Pago");
  }

  async hasTable() {
    return this.elementExists("//table[contains(@class,'pagos-table')]");
  }
}

module.exports = PagosPage;
