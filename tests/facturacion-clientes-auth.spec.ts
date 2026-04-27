import { expect, test, type APIRequestContext } from '@playwright/test';

const API_BASE_URL = process.env.PW_API_BASE_URL ?? 'http://localhost:7820/api';
const CLIENTES_ENDPOINT = `${API_BASE_URL}/invoicing/clientes`;

const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL ?? 'admin1@parkontrol.com';
const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD ?? 'Admin1234';

const CLIENT_EMAIL = process.env.PW_CLIENT_EMAIL;
const CLIENT_PASSWORD = process.env.PW_CLIENT_PASSWORD;

const OPERATOR_EMAIL = process.env.PW_OPERATOR_EMAIL;
const OPERATOR_PASSWORD = process.env.PW_OPERATOR_PASSWORD;

// Nota importante:
// En backend/src/controller/facturacion/facturacion.controller.ts,
// los @UseGuards(JwtAuthGuard, RolesGuard) están comentados.
// Por eso hoy la API responde 200 incluso sin token o con token inválido.
const EXPECTED_STATUS_WITH_CURRENT_SOURCE = 200;

type TipoAcceso = 'CLIENTE' | 'ADMIN' | 'OPERADOR';

async function getTokenByLogin(
  request: APIRequestContext,
  tipoAcceso: TipoAcceso,
  correo: string,
  contrasena: string,
): Promise<string> {
  const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      correo,
      contrasena,
      tipoAcceso,
    },
  });

  expect(
    loginResponse.ok(),
    `No fue posible autenticar ${tipoAcceso}. Revisa credenciales/seed para pruebas E2E.`,
  ).toBeTruthy();

  const loginBody = (await loginResponse.json()) as { access_token?: string };
  expect(loginBody.access_token, `No se recibió access_token para ${tipoAcceso}.`).toBeTruthy();

  return String(loginBody.access_token);
}

function assertClientesPayloadShape(payload: unknown): void {
  expect(Array.isArray(payload)).toBeTruthy();

  const clientes = payload as Array<Record<string, unknown>>;
  if (clientes.length === 0) {
    return;
  }

  const cliente = clientes[0];
  expect(cliente).toHaveProperty('id');
  expect(cliente).toHaveProperty('tipoDocumento');
  expect(cliente).toHaveProperty('numeroDocumento');
  expect(cliente).toHaveProperty('correo');
}

test.describe('Facturacion - GET clientes (consulta BD)', () => {
  test('1) GET clientes desde cuenta sin autenticacion', async ({ request }) => {
    const response = await request.get(CLIENTES_ENDPOINT);

    expect(response.status()).toBe(EXPECTED_STATUS_WITH_CURRENT_SOURCE);
    assertClientesPayloadShape(await response.json());
  });

  test('2) GET clientes con token de autenticacion invalido', async ({ request }) => {
    const response = await request.get(CLIENTES_ENDPOINT, {
      headers: {
        Authorization: 'Bearer token_invalido_playwright',
      },
    });

    expect(response.status()).toBe(EXPECTED_STATUS_WITH_CURRENT_SOURCE);
    assertClientesPayloadShape(await response.json());
  });

  test('3) GET clientes con token de cliente', async ({ request }) => {
    test.skip(
      !CLIENT_EMAIL || !CLIENT_PASSWORD,
      'Define PW_CLIENT_EMAIL y PW_CLIENT_PASSWORD para ejecutar este caso.',
    );

    const tokenCliente = await getTokenByLogin(
      request,
      'CLIENTE',
      String(CLIENT_EMAIL),
      String(CLIENT_PASSWORD),
    );

    const response = await request.get(CLIENTES_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${tokenCliente}`,
      },
    });

    expect(response.status()).toBe(EXPECTED_STATUS_WITH_CURRENT_SOURCE);
    assertClientesPayloadShape(await response.json());
  });

  test('4) GET clientes con token de admin', async ({ request }) => {
    const tokenAdmin = await getTokenByLogin(
      request,
      'ADMIN',
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    );

    const response = await request.get(CLIENTES_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

    expect(response.status()).toBe(EXPECTED_STATUS_WITH_CURRENT_SOURCE);
    assertClientesPayloadShape(await response.json());
  });

  test('5) GET clientes con token de operador', async ({ request }) => {
    test.skip(
      !OPERATOR_EMAIL || !OPERATOR_PASSWORD,
      'Define PW_OPERATOR_EMAIL y PW_OPERATOR_PASSWORD para ejecutar este caso.',
    );

    const tokenOperador = await getTokenByLogin(
      request,
      'OPERADOR',
      String(OPERATOR_EMAIL),
      String(OPERATOR_PASSWORD),
    );

    const response = await request.get(CLIENTES_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${tokenOperador}`,
      },
    });

    expect(response.status()).toBe(EXPECTED_STATUS_WITH_CURRENT_SOURCE);
    assertClientesPayloadShape(await response.json());
  });
});
