import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

const API_BASE_URL = process.env.PW_API_BASE_URL ?? 'http://localhost:7820/api';
const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL ?? 'admin1@parkontrol.com';
const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD ?? 'Admin1234';

const usedPaymentIds = new Set<number>();

async function getAdminToken(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      correo: ADMIN_EMAIL,
      contrasena: ADMIN_PASSWORD,
      tipoAcceso: 'ADMIN',
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { access_token?: string };
  expect(body.access_token).toBeTruthy();

  return String(body.access_token);
}

async function getPaymentById(
  request: APIRequestContext,
  token: string,
  idPago: number,
): Promise<{ exists: boolean; data?: Record<string, any> }> {
  const response = await request.get(`${API_BASE_URL}/payments/${idPago}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status() === 404) {
    return { exists: false };
  }

  if (!response.ok()) {
    return { exists: false };
  }

  return { exists: true, data: (await response.json()) as Record<string, any> };
}

async function hasInvoiceByPaymentId(
  request: APIRequestContext,
  idPago: number,
): Promise<boolean> {
  const response = await request.get(`${API_BASE_URL}/invoicing/facturas/pago/${idPago}`);

  if (response.status() === 404) {
    return false;
  }

  return response.ok();
}

async function findPaymentId(
  request: APIRequestContext,
  token: string,
  options: { shouldHaveInvoice: boolean; requireAssignedClient?: boolean },
): Promise<{ idPago: number; assignedClientId?: number } | null> {
  for (let idPago = 1; idPago <= 400; idPago += 1) {
    if (usedPaymentIds.has(idPago)) {
      continue;
    }

    const payment = await getPaymentById(request, token, idPago);
    if (!payment.exists) {
      continue;
    }

    const invoiced = await hasInvoiceByPaymentId(request, idPago);
    if (invoiced !== options.shouldHaveInvoice) {
      continue;
    }

    const assignedClientId = Number(payment.data?.reserva?.clienteFactura?.id ?? NaN);
    if (options.requireAssignedClient && Number.isNaN(assignedClientId)) {
      continue;
    }

    usedPaymentIds.add(idPago);

    return Number.isNaN(assignedClientId)
      ? { idPago }
      : { idPago, assignedClientId };
  }

  return null;
}

async function openFacturaModal(page: Page): Promise<Locator> {
  await page.getByRole('link', { name: /Facturacion/i }).click();
  await expect(page).toHaveURL(/\/facturacion$/);

  await page.getByRole('tab', { name: /Facturas/i }).click();
  await page.getByRole('button', { name: /Nueva Factura/i }).click();

  const dialog = page.locator('mat-dialog-container');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /Crear Factura/i })).toBeVisible();

  return dialog;
}

function getFacturaModalControls(dialog: Locator) {
  return {
    idPago: dialog.locator('input[formcontrolname="idPago"]'),
    idClienteFactura: dialog.locator('mat-select[formcontrolname="idClienteFactura"]'),
    aceptar: dialog.getByRole('button', { name: /^Aceptar$/ }),
    cancelar: dialog.getByRole('button', { name: /^Cancelar$/ }),
  };
}

async function selectAnyClient(dialog: Locator): Promise<{ selectedClientId?: number }> {
  const select = dialog.locator('mat-select[formcontrolname="idClienteFactura"]');
  await select.click();

  const options = dialog.page().locator('mat-option');
  const count = await options.count();

  for (let i = 0; i < count; i += 1) {
    const option = options.nth(i);
    const text = (await option.textContent())?.trim() ?? '';
    if (!text.includes(' - ')) {
      continue;
    }

    const rawValue = await option.getAttribute('ng-reflect-value');
    await option.click();

    const parsed = rawValue ? Number(rawValue) : Number.NaN;
    return Number.isNaN(parsed) ? {} : { selectedClientId: parsed };
  }

  await dialog.page().keyboard.press('Escape');
  return {};
}

async function selectClientDifferentFrom(
  dialog: Locator,
  assignedClientId: number,
): Promise<{ selectedClientId?: number }> {
  const select = dialog.locator('mat-select[formcontrolname="idClienteFactura"]');
  await select.click();

  const options = dialog.page().locator('mat-option');
  const count = await options.count();

  for (let i = 0; i < count; i += 1) {
    const option = options.nth(i);
    const text = (await option.textContent())?.trim() ?? '';
    if (!text.includes(' - ')) {
      continue;
    }

    const rawValue = await option.getAttribute('ng-reflect-value');
    const parsed = rawValue ? Number(rawValue) : Number.NaN;

    if (!Number.isNaN(parsed) && parsed !== assignedClientId) {
      await option.click();
      return { selectedClientId: parsed };
    }
  }

  await dialog.page().keyboard.press('Escape');
  return {};
}

test.describe('Facturacion - UI creacion de facturas', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('1) creacion de factura exitosa sin incluir cliente de facturacion', async ({ page, request }) => {
    const token = await getAdminToken(request);
    const candidate = await findPaymentId(request, token, {
      shouldHaveInvoice: false,
      requireAssignedClient: false,
    });

    test.skip(!candidate, 'No se encontro un pago sin factura para ejecutar el caso.');

    const dialog = await openFacturaModal(page);
    const controls = getFacturaModalControls(dialog);

    await controls.idPago.fill(String(candidate.idPago));

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/invoicing/facturas') && response.request().method() === 'POST',
    );

    await controls.aceptar.click();

    const response = await createResponse;
    expect(response.ok()).toBeTruthy();

    const body = (await response.json()) as Record<string, any>;
    expect(Number(body?.pago?.id ?? body?.idPago)).toBe(candidate.idPago);
    await expect(page.locator('.mensaje-exito')).toContainText(/Factura creada exitosamente/i);
  });

  test('2) creacion de factura incluyendo cliente de facturacion', async ({ page, request }) => {
    const token = await getAdminToken(request);
    const candidate = await findPaymentId(request, token, {
      shouldHaveInvoice: false,
      requireAssignedClient: false,
    });

    test.skip(!candidate, 'No se encontro un pago sin factura para ejecutar el caso.');

    const dialog = await openFacturaModal(page);
    const controls = getFacturaModalControls(dialog);

    await controls.idPago.fill(String(candidate.idPago));
    const selectedClient = await selectAnyClient(dialog);

    test.skip(!selectedClient.selectedClientId, 'No hay clientes de facturacion disponibles para seleccionar.');

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/invoicing/facturas') && response.request().method() === 'POST',
    );

    await controls.aceptar.click();

    const response = await createResponse;
    expect(response.ok()).toBeTruthy();

    const body = (await response.json()) as Record<string, any>;
    expect(Number(body?.pago?.id ?? body?.idPago)).toBe(candidate.idPago);
    await expect(page.locator('.mensaje-exito')).toContainText(/Factura creada exitosamente/i);
  });

  test('3) creacion de factura con id de pago inexistente', async ({ page }) => {
    const dialog = await openFacturaModal(page);
    const controls = getFacturaModalControls(dialog);

    await controls.idPago.fill('99999999');

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/invoicing/facturas') && response.request().method() === 'POST',
    );

    await controls.aceptar.click();

    const response = await createResponse;
    expect(response.ok()).toBeFalsy();
    await expect(page.locator('.mensaje-error')).toContainText(/Error al crear la factura/i);
  });

  test('4) creacion de factura con id pago repetido', async ({ page, request }) => {
    const token = await getAdminToken(request);
    const candidate = await findPaymentId(request, token, {
      shouldHaveInvoice: true,
      requireAssignedClient: false,
    });

    test.skip(!candidate, 'No se encontro un pago ya facturado para ejecutar el caso.');

    const dialog = await openFacturaModal(page);
    const controls = getFacturaModalControls(dialog);

    await controls.idPago.fill(String(candidate.idPago));

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/invoicing/facturas') && response.request().method() === 'POST',
    );

    await controls.aceptar.click();

    const response = await createResponse;
    expect(response.ok()).toBeTruthy();

    const body = (await response.json()) as Record<string, any>;
    expect(Number(body?.pago?.id ?? body?.idPago)).toBe(candidate.idPago);
    await expect(page.locator('.mensaje-exito')).toContainText(/Factura creada exitosamente/i);
  });

  test('5) creacion de factura con cliente diferente al asignado en reserva', async ({ page, request }) => {
    const token = await getAdminToken(request);
    const candidate = await findPaymentId(request, token, {
      shouldHaveInvoice: false,
      requireAssignedClient: true,
    });

    test.skip(
      !candidate?.assignedClientId,
      'No se encontro un pago sin factura con cliente asignado en reserva.',
    );

    const dialog = await openFacturaModal(page);
    const controls = getFacturaModalControls(dialog);

    await controls.idPago.fill(String(candidate.idPago));

    const selected = await selectClientDifferentFrom(dialog, candidate.assignedClientId);
    test.skip(
      !selected.selectedClientId,
      'No se encontro un cliente alterno diferente al asignado en la reserva.',
    );

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/invoicing/facturas') && response.request().method() === 'POST',
    );

    await controls.aceptar.click();

    const response = await createResponse;
    expect(response.ok()).toBeTruthy();

    const body = (await response.json()) as Record<string, any>;
    const responseClientId = Number(body?.clienteFactura?.id ?? Number.NaN);

    if (!Number.isNaN(responseClientId)) {
      expect(responseClientId).not.toBe(candidate.assignedClientId);
    }

    await expect(page.locator('.mensaje-exito')).toContainText(/Factura creada exitosamente/i);
  });
});
