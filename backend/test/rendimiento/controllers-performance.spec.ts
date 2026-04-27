import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthController } from 'src/controller/auth/auth.controller';
import { CeldasController } from 'src/controller/celdas/celdas.controller';
import { EmpresasController } from 'src/controller/empresas/empresas.controller';
import { FacturacionController } from 'src/controller/facturacion/facturacion.controller';
import { PagosController } from 'src/controller/pagos/pagos.controller';
import { ParqueaderosController } from 'src/controller/parqueaderos/parqueaderos.controller';
import { ReportesController } from 'src/controller/reportes/reportes.controller';
import { ReservasController } from 'src/controller/reservas/reservas.controller';
import { TarifasController } from 'src/controller/tarifas/tarifas.controller';
import { UsuariosController } from 'src/controller/usuarios/usuarios.controller';
import { VehiculosController } from 'src/controller/vehiculos/vehiculos.controller';
import { VistasController } from 'src/controller/vistas/vistas.controller';

const MAX_RESPONSE_TIME_MS = 250;

async function measure<T>(fn: () => Promise<T> | T): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  const durationMs = Date.now() - start;
  return { result, durationMs };
}

describe('Backend Controller Performance Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthController', () => {
    it('should execute login within performance threshold', async () => {
      const authService = {
        login: jest.fn().mockResolvedValue({ access_token: 'token' }),
      } as any;
      const controller = new AuthController(authService);

      const { durationMs } = await measure(() =>
        controller.login({ correo: 'test@example.com', contrasena: '12345' } as any),
      );

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(authService.login).toHaveBeenCalled();
    });

    it('should throw forbidden exception quickly for registerAdminDisabled', () => {
      const controller = new AuthController({} as any);
      const start = Date.now();

      expect(() => controller.registerAdminDisabled()).toThrow(ForbiddenException);
      expect(Date.now() - start).toBeLessThan(MAX_RESPONSE_TIME_MS);
    });
  });

  describe('CeldasController', () => {
    it('should create a cell within performance threshold', async () => {
      const celdasService = {
        crear: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new CeldasController(celdasService);

      const { durationMs } = await measure(() => controller.crear({} as any));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(celdasService.crear).toHaveBeenCalled();
    });

    it('should fetch a cell by id within threshold', async () => {
      const celdasService = {
        findCeldaById: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new CeldasController(celdasService);

      const { durationMs } = await measure(() => controller.obtenerPorId(1));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(celdasService.findCeldaById).toHaveBeenCalledWith(1);
    });
  });

  describe('EmpresasController', () => {
    it('should return all companies within threshold', async () => {
      const empresasService = {
        obtenerTodas: jest.fn().mockResolvedValue([{ id: 1 }]),
      } as any;
      const controller = new EmpresasController(empresasService);

      const { durationMs } = await measure(() => controller.obtenerTodas());

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(empresasService.obtenerTodas).toHaveBeenCalled();
    });

    it('should return company details within threshold', async () => {
      const empresasService = {
        obtenerDetalle: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new EmpresasController(empresasService);

      const { durationMs } = await measure(() => controller.obtenerDetalle(1));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(empresasService.obtenerDetalle).toHaveBeenCalledWith(1);
    });
  });

  describe('FacturacionController', () => {
    it('should create a client invoice within threshold', async () => {
      const facturacionService = {
        crearCliente: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new FacturacionController(facturacionService);

      const { durationMs } = await measure(() =>
        controller.crearCliente({} as any),
      );

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(facturacionService.crearCliente).toHaveBeenCalled();
    });

    it('should fetch invoice by payment id within threshold', async () => {
      const facturacionService = {
        findByPago: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new FacturacionController(facturacionService);

      const { durationMs } = await measure(() => controller.obtenerPorPago(1));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(facturacionService.findByPago).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException quickly when invoice not found', async () => {
      const facturacionService = {
        findByPago: jest.fn().mockResolvedValue(null),
      } as any;
      const controller = new FacturacionController(facturacionService);
      const start = Date.now();

      await expect(controller.obtenerPorPago(1)).rejects.toThrow(NotFoundException);
      expect(Date.now() - start).toBeLessThan(MAX_RESPONSE_TIME_MS);
    });
  });

  describe('PagosController', () => {
    it('should create a payment within threshold', async () => {
      const pagosService = {
        crear: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new PagosController(pagosService);

      const { durationMs } = await measure(() => controller.crear({} as any));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(pagosService.crear).toHaveBeenCalled();
    });

    it('should fetch payment by id within threshold', async () => {
      const pagosService = {
        findPagoById: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new PagosController(pagosService);

      const { durationMs } = await measure(() => controller.obtenerPorId(1));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(pagosService.findPagoById).toHaveBeenCalledWith(1);
    });
  });

  describe('ParqueaderosController', () => {
    it('should fetch available parking lots within threshold', async () => {
      const parqueaderosService = {
        findAllConDisponibilidad: jest.fn().mockResolvedValue([]),
      } as any;
      const controller = new ParqueaderosController(parqueaderosService);

      const { durationMs } = await measure(() =>
        controller.obtenerDisponiblesParaCliente(),
      );

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(parqueaderosService.findAllConDisponibilidad).toHaveBeenCalled();
    });

    it('should fetch parking lot detail within threshold', async () => {
      const parqueaderosService = {
        obtenerDetalle: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new ParqueaderosController(parqueaderosService);

      const { durationMs } = await measure(() => controller.obtenerDetalle(1));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(parqueaderosService.obtenerDetalle).toHaveBeenCalledWith(1);
    });
  });

  describe('ReportesController', () => {
    it('should create a report within threshold', async () => {
      const reportesService = {
        crear: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new ReportesController(reportesService);

      const { durationMs } = await measure(() => controller.crear({} as any));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(reportesService.crear).toHaveBeenCalled();
    });

    it('should update report url within threshold', async () => {
      const reportesService = {
        actualizarUrl: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new ReportesController(reportesService);

      const { durationMs } = await measure(() => controller.actualizarUrl(1, 'http://url'));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(reportesService.actualizarUrl).toHaveBeenCalledWith(1, 'http://url');
    });
  });

  describe('ReservasController', () => {
    const clientUser = { id: 1, correo: 'user@test.com', nombreRol: 'CLIENTE' } as any;

    it('should fetch client reservations within threshold', async () => {
      const reservasService = {
        findByClienteFacturaOrCorreo: jest.fn().mockResolvedValue([]),
      } as any;
      const controller = new ReservasController(reservasService);

      const { durationMs } = await measure(() =>
        controller.obtenerMisReservas(clientUser),
      );

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(reservasService.findByClienteFacturaOrCorreo).toHaveBeenCalledWith(1, 'user@test.com');
    });

    it('should create client reservation within threshold', async () => {
      const reservasService = {
        crearParaCliente: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new ReservasController(reservasService);

      const { durationMs } = await measure(() =>
        controller.crearComoCliente(clientUser, {} as any),
      );

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(reservasService.crearParaCliente).toHaveBeenCalledWith(1, {});
    });
  });

  describe('TarifasController', () => {
    it('should create a rate within threshold', async () => {
      const tarifasService = {
        crear: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new TarifasController(tarifasService);

      const { durationMs } = await measure(() => controller.crear({} as any));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(tarifasService.crear).toHaveBeenCalled();
    });

    it('should fetch rates by parking lot within threshold', async () => {
      const tarifasService = {
        findByParqueadero: jest.fn().mockResolvedValue([]),
      } as any;
      const controller = new TarifasController(tarifasService);

      const { durationMs } = await measure(() => controller.obtenerPorParqueadero(1));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(tarifasService.findByParqueadero).toHaveBeenCalledWith(1);
    });
  });

  describe('UsuariosController', () => {
    it('should create a user within threshold', async () => {
      const usuariosService = {
        crear: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new UsuariosController(usuariosService);

      const { durationMs } = await measure(() =>
        controller.crear({ rol: 'ADMIN' } as any),
      );

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(usuariosService.crear).toHaveBeenCalled();
    });

    it('should change password within threshold', async () => {
      const usuariosService = {
        cambiarContrasena: jest.fn().mockResolvedValue({ mensaje: 'OK' }),
      } as any;
      const controller = new UsuariosController(usuariosService);
      const user = { id: 2 } as any;

      const { durationMs } = await measure(() =>
        controller.cambiarContrasena(user, { contrasenaActual: 'old', contrasenaNueva: 'new' } as any),
      );

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(usuariosService.cambiarContrasena).toHaveBeenCalledWith(2, expect.any(Object));
    });
  });

  describe('VehiculosController', () => {
    it('should validate placa and fetch by placa within threshold', async () => {
      const vehiculosService = {
        findByPlaca: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new VehiculosController(vehiculosService);

      const { durationMs } = await measure(() => controller.obtenerPorPlaca('ABC123'));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(vehiculosService.findByPlaca).toHaveBeenCalledWith('ABC123');
    });

    it('should throw NotFoundException quickly when vehicle not found', async () => {
      const vehiculosService = {
        findByPlaca: jest.fn().mockResolvedValue(null),
      } as any;
      const controller = new VehiculosController(vehiculosService);
      const start = Date.now();

      await expect(controller.obtenerPorPlaca('ABC123')).rejects.toThrow(NotFoundException);
      expect(Date.now() - start).toBeLessThan(MAX_RESPONSE_TIME_MS);
    });
  });

  describe('VistasController', () => {
    it('should fetch occupacion for empresa within threshold', async () => {
      const vistasService = {
        getOcupacionByEmpresa: jest.fn().mockResolvedValue([{ id: 1 }]),
      } as any;
      const controller = new VistasController(vistasService);

      const { durationMs } = await measure(() => controller.getOcupacionParqueaderos('1'));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(vistasService.getOcupacionByEmpresa).toHaveBeenCalledWith(1);
    });

    it('should fetch vehiculo by placa within threshold', async () => {
      const vistasService = {
        buscarVehiculoPorPlaca: jest.fn().mockResolvedValue({ id: 1 }),
      } as any;
      const controller = new VistasController(vistasService);

      const { durationMs } = await measure(() => controller.buscarVehiculoPorPlaca('ABC123'));

      expect(durationMs).toBeLessThan(MAX_RESPONSE_TIME_MS);
      expect(vistasService.buscarVehiculoPorPlaca).toHaveBeenCalledWith('ABC123');
    });
  });
});
