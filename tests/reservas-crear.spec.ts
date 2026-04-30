import { expect, test, type Locator, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

async function openReservas(page: Page): Promise<void> {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Reservas/i }).click();
  await expect(page).toHaveURL(/\/reservas/);
}

async function openNuevoReserva(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: /Nueva Reserva/i }).click();
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /Nueva Reserva/i })).toBeVisible();
  return dialog;
}

function getReservaDialogControls(dialog: Locator) {
  return {
    placa: dialog.locator('input[formcontrolname="placa"]'),
    celda: dialog.locator('mat-select[formcontrolname="idCelda"]'),
    horaInicio: dialog.locator('input[formcontrolname="horaInicio"]'),
    horaFin: dialog.locator('input[formcontrolname="horaFin"]'),
    crearReserva: dialog.getByRole('button', { name: /Crear Reserva/i }),
  };
}

test.describe('Reservas - creación de reserva', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await openReservas(page);
  });

  test('1) crea reserva con datos validos', async ({ page }: { page: Page }) => {
    const dialog = await openNuevoReserva(page);
    const controls = getReservaDialogControls(dialog);

    await controls.placa.fill(`AUTO${Date.now().toString().slice(-6)}`);
    await controls.celda.click();
    await dialog.locator('mat-option:not([disabled])').first().click();

    await controls.horaInicio.fill('2026-05-05T09:00');
    await controls.horaFin.fill('2026-05-05T11:00');

    await expect(controls.crearReserva).toBeEnabled();
    await controls.crearReserva.click();

    await expect(page.locator('.mensaje-exito')).toBeVisible();
  });

  test('2) no permite crear reserva sin placa', async ({ page }: { page: Page }) => {
    const dialog = await openNuevoReserva(page);
    const controls = getReservaDialogControls(dialog);

    await controls.celda.click();
    await dialog.locator('mat-option:not([disabled])').first().click();
    await controls.horaInicio.fill('2026-05-05T09:00');
    await controls.horaFin.fill('2026-05-05T11:00');

    await expect(controls.crearReserva).toBeDisabled();
  });

  test('3) no permite crear reserva con hora fin anterior a hora inicio', async ({ page }: { page: Page }) => {
    const dialog = await openNuevoReserva(page);
    const controls = getReservaDialogControls(dialog);

    await controls.placa.fill(`AUTO${Date.now().toString().slice(-6)}`);
    await controls.celda.click();
    await dialog.locator('mat-option:not([disabled])').first().click();

    await controls.horaInicio.fill('2026-05-05T12:00');
    await controls.horaFin.fill('2026-05-05T10:00');

    await expect(controls.crearReserva).toBeDisabled();
  });
});
