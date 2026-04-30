import { expect, test, type Locator, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

async function openPagos(page: Page): Promise<void> {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Pagos/i }).click();
  await expect(page).toHaveURL(/\/pagos/);
}

async function openNuevoPago(page: Page): Promise<Locator> {
  const nuevoPagoButton = page.getByRole('button', { name: /Nuevo Pago/i }).first();
  await nuevoPagoButton.click();
  return page.locator('mat-dialog-container, .mat-mdc-dialog-container').first();
}

function getPagoFields(dialog: Locator) {
  return {
    reservaSelect: dialog.locator('mat-select[formcontrolname="idReserva"], mat-select').first(),
    cantidad: dialog.locator('input[type="number"], input[formcontrolname="cantidad"], input[formcontrolname="valor"]').first(),
    procesar: dialog.getByRole('button', { name: /Procesar Pago|Pagar|Crear Pago/i }).first(),
  };
}

test.describe('Pagos - UI creacion', () => {
  test.beforeEach(async ({ page }) => {
    await openPagos(page);
  });

  test('1) crea pago con dato válido', async ({ page }) => {
    const dialog = await openNuevoPago(page);
    const fields = getPagoFields(dialog);
    await fields.reservaSelect.click();
    await page.locator('mat-option').first().click();
    await fields.cantidad.fill('1');
    await expect(fields.procesar).toBeEnabled();
    await fields.procesar.click();
    await expect(page.locator('.mensaje-exito')).toBeVisible();
  });

  test('2) no permite crear pago sin reserva seleccionada', async ({ page }) => {
    const dialog = await openNuevoPago(page);
    const fields = getPagoFields(dialog);
    await fields.cantidad.fill('1');
    await expect(fields.procesar).toBeDisabled();
  });

  test('3) no permite crear pago con cantidad cero', async ({ page }) => {
    const dialog = await openNuevoPago(page);
    const fields = getPagoFields(dialog);
    await fields.reservaSelect.click();
    await page.locator('mat-option').first().click();
    await fields.cantidad.fill('0');
    await fields.cantidad.blur();
    await expect(fields.procesar).toBeDisabled();
  });
});
