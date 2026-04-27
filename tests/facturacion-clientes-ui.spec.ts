import { expect, test, type Locator, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

async function openNuevoClienteModal(page: Page): Promise<Locator> {
  await page.getByRole('link', { name: /Facturacion/i }).click();
  await expect(page).toHaveURL(/\/facturacion$/);

  await page.getByRole('button', { name: /\+ Nuevo Cliente/i }).click();

  const dialog = page.locator('mat-dialog-container');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /Crear Cliente/i })).toBeVisible();

  return dialog;
}

function getClienteModalControls(dialog: Locator) {
  return {
    tipoDocumento: dialog.locator('mat-select[formcontrolname="tipoDocumento"]'),
    numeroDocumento: dialog.locator('input[formcontrolname="numeroDocumento"]'),
    correo: dialog.locator('input[formcontrolname="correo"]'),
    aceptar: dialog.getByRole('button', { name: /Aceptar|Procesando/i }),
    cancelar: dialog.getByRole('button', { name: /^Cancelar$/ }),
  };
}

function buildUniqueNumeroDocumento(): string {
  const timestamp = Date.now().toString();
  return timestamp.slice(-10);
}

function buildUniqueCorreo(): string {
  const suffix = Date.now().toString().slice(-8);
  return `cliente.${suffix}@e2e.test`;
}

test.describe('Facturacion - UI creacion de clientes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('1) crea cliente exitosamente con campos correctos', async ({ page }) => {
    const dialog = await openNuevoClienteModal(page);
    const controls = getClienteModalControls(dialog);
    const numero = buildUniqueNumeroDocumento();
    const correo = buildUniqueCorreo();

    await controls.numeroDocumento.fill(numero);
    await controls.correo.fill(correo);

    await expect(controls.aceptar).toBeEnabled();
    await controls.aceptar.click();

    await expect(page.locator('mat-dialog-container')).toHaveCount(0);
    await expect(page.locator('.mensaje-exito')).toContainText(
      `Cliente con numero documento ${numero} creado exitosamente`,
    );
  });

  test('2) no permite crear cliente sin numero de identificacion', async ({ page }) => {
    const dialog = await openNuevoClienteModal(page);
    const controls = getClienteModalControls(dialog);

    await controls.numeroDocumento.fill('');
    await controls.numeroDocumento.blur();
    await controls.correo.fill('arseas@yopmail.com');

    await expect(controls.aceptar).toBeDisabled();
    await expect(dialog.getByText(/Este campo es obligatorio/i)).toBeVisible();
  });

  test('3) no permite crear cliente con 3 caracteres en numero de identificacion', async ({ page }) => {
    const dialog = await openNuevoClienteModal(page);
    const controls = getClienteModalControls(dialog);

    await controls.numeroDocumento.fill('123');
    await controls.numeroDocumento.blur();
    await controls.correo.fill('arberto@gmail.com');

    await expect(controls.aceptar).toBeDisabled();
    await expect(
      dialog.getByText(/CC: solo numeros \(6 a 10 digitos\)|CC: solo números \(6 a 10 dígitos\)/i),
    ).toBeVisible();
  });

  test('4) no permite crear cliente con 20 caracteres en numero documento para tipo CC', async ({ page }) => {
    const dialog = await openNuevoClienteModal(page);
    const controls = getClienteModalControls(dialog);

    await controls.numeroDocumento.fill('12345678901234567890');
    await controls.numeroDocumento.blur();
    await controls.correo.fill('astolfo@gmail.com');

    await expect(controls.aceptar).toBeDisabled();
    await expect(
      dialog.getByText(/CC: solo numeros \(6 a 10 digitos\)|CC: solo números \(6 a 10 dígitos\)/i),
    ).toBeVisible();
  });

  test('5) no permite crear cliente sin correo', async ({ page }) => {
    const dialog = await openNuevoClienteModal(page);
    const controls = getClienteModalControls(dialog);

    await controls.numeroDocumento.fill('1029726');
    await controls.correo.fill('');
    await controls.correo.blur();

    await expect(controls.aceptar).toBeDisabled();
    await expect(dialog.getByText(/Este campo es obligatorio/i)).toBeVisible();
  });

  test('6) no permite crear cliente sin incluir @ en el correo', async ({ page }) => {
    const dialog = await openNuevoClienteModal(page);
    const controls = getClienteModalControls(dialog);

    await controls.numeroDocumento.fill('1023742');
    await controls.correo.fill('arberjagmail.com');
    await controls.correo.blur();

    await expect(controls.aceptar).toBeDisabled();
    await expect(dialog.getByText(/Correo invalido|Correo inválido/i)).toBeVisible();
  });

  test('7) no permite crear cliente sin dominio en el correo', async ({ page }) => {
    const dialog = await openNuevoClienteModal(page);
    const controls = getClienteModalControls(dialog);

    await controls.numeroDocumento.fill('1023432');
    await controls.correo.fill('arberto@');
    await controls.correo.blur();

    await expect(controls.aceptar).toBeDisabled();
    await expect(dialog.getByText(/Correo invalido|Correo inválido/i)).toBeVisible();
  });
});
