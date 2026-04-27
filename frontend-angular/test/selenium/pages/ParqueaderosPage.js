const BasePage = require("./BasePage");

class ParqueaderosPage extends BasePage {
  async open() {
    await super.open("/parqueaderos");
    await this.waitForUrlContains("/parqueaderos");
  }

  async hasCreateButton() {
    return this.elementExists(
      "//button[contains(normalize-space(.),'Nuevo Parqueadero') or contains(normalize-space(.),'Crear primer parqueadero')]"
    );
  }

  async openCreateModal() {
    return this.clickButtonByText("Nuevo Parqueadero");
  }

  async hasTable() {
    return this.elementExists("//table[contains(@class,'mat-elevation-2')]");
  }
}

module.exports = ParqueaderosPage;
