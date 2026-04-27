import { expect, test, type Locator, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

async function openParqueaderosModal(page: Page): Promise<Locator> {
  await page.getByRole('link', { name: /Parqueaderos/i }).click();
  await expect(page).toHaveURL(/\/parqueaderos$/);

  const openModalButton = page
    .getByRole('button', { name: /Nuevo Parqueadero|Crear primer parqueadero/i })
    .first();
  await openModalButton.click();

  const dialog = page.locator('mat-dialog-container');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /Nuevo parqueadero/i })).toBeVisible();

  return dialog;
}

function getModalControls(dialog: Locator) {
  return {
    nombre: dialog.locator('input[formcontrolname="nombre"]'),
    ubicacion: dialog.locator('input[formcontrolname="ubicacion"]'),
    capacidadTotal: dialog.locator('input[formcontrolname="capacidadTotal"]'),
    crear: dialog.getByRole('button', { name: /^Crear$/ }),
    cancelar: dialog.getByRole('button', { name: /^Cancelar$/ }),
  };
}

test.describe('Parqueaderos - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('1) crea parqueadero correctamente con inicio de sesion', async ({ page }) => {
    const dialog = await openParqueaderosModal(page);
    const controls = getModalControls(dialog);
    const uniqueName = `PARK-${Date.now()}`;

    await controls.nombre.fill(uniqueName);
    await controls.ubicacion.fill('Calle 19 B sur #30-29');
    await controls.capacidadTotal.fill('150');

    await expect(controls.crear).toBeEnabled();
    await controls.crear.click();

    await expect(page.locator('mat-dialog-container')).toHaveCount(0);
    await expect(page.getByRole('cell', { name: uniqueName })).toBeVisible();
  });

  test('2) no permite crear sin nombre', async ({ page }) => {
    const dialog = await openParqueaderosModal(page);
    const controls = getModalControls(dialog);

    await controls.ubicacion.fill('Calle 59 Sur');
    await controls.capacidadTotal.fill('100');

    await expect(controls.crear).toBeDisabled();
  });

  test('3) no permite crear sin ubicacion', async ({ page }) => {
    const dialog = await openParqueaderosModal(page);
    const controls = getModalControls(dialog);

    await controls.nombre.fill('PARKENV');
    await controls.capacidadTotal.fill('100');

    await expect(controls.crear).toBeDisabled();
  });

  test('4) no permite crear con capacidad vacia', async ({ page }) => {
    const dialog = await openParqueaderosModal(page);
    const controls = getModalControls(dialog);

    await controls.nombre.fill('PARKENV');
    await controls.ubicacion.fill('CALLE 19 SUR');
    await controls.capacidadTotal.fill('');
    await controls.capacidadTotal.blur();

    await expect(controls.crear).toBeDisabled();
    await expect(dialog.getByText(/La capacidad es requerida/i)).toBeVisible();
  });

  test('5) no permite crear con capacidad negativa', async ({ page }) => {
    const dialog = await openParqueaderosModal(page);
    const controls = getModalControls(dialog);

    await controls.nombre.fill('ALCENTRAL');
    await controls.ubicacion.fill('CALLE 19 SUR');
    await controls.capacidadTotal.fill('-15');
    await controls.capacidadTotal.blur();

    await expect(controls.crear).toBeDisabled();
    await expect(dialog.getByText(/La capacidad debe ser mayor a 0/i)).toBeVisible();
  });

  test('6) permite continuar con nombre de 99 caracteres', async ({ page }) => {
    const dialog = await openParqueaderosModal(page);
    const controls = getModalControls(dialog);

    await controls.nombre.fill('A'.repeat(99));
    await controls.ubicacion.fill('Calle 50 Sur');
    await controls.capacidadTotal.fill('120');

    await expect(controls.crear).toBeEnabled();
    await controls.cancelar.click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);
  });

  test('7) rechaza nombre con mas de 100 caracteres', async ({ page }) => {
    const dialog = await openParqueaderosModal(page);
    const controls = getModalControls(dialog);

    await controls.nombre.fill('A'.repeat(101));
    await controls.ubicacion.fill('CALLE 16');
    await controls.capacidadTotal.fill('130');

    await expect(controls.crear).toBeEnabled();

    const createRequest = page.waitForResponse((response) =>
      response.url().includes('/parking-lots') && response.request().method() === 'POST'
    );

    await controls.crear.click();

    const response = await createRequest;
    expect(response.ok()).toBeFalsy();
    await expect(page.locator('mat-dialog-container')).toBeVisible();
  });
});
