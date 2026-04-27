const BasePage = require("./BasePage");

class TarifasPage extends BasePage {
  async open() {
    await super.open("/tarifas");
    await this.waitForUrlContains("/tarifas");
  }

  async hasCreateButton() {
    return this.elementExists(
      "//button[contains(normalize-space(.),'Nueva Tarifa')]"
    );
  }

  async openCreateModal() {
    return this.clickButtonByText("Nueva Tarifa");
  }

  async hasTable() {
    return this.elementExists("//table[contains(@class,'tarifas-table')]");
  }

  async hasCreateOrEditAction() {
    return this.elementExists(
      "//button[contains(normalize-space(.),'Editar') or contains(normalize-space(.),'Nueva Tarifa')]"
    );
  }
}

module.exports = TarifasPage;
