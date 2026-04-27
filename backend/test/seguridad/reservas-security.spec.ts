import { UnauthorizedException } from '@nestjs/common';
import { ReservasController } from 'src/controller/reservas/reservas.controller';

describe('ReservasController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const clienteUser = { id: 1, correo: 'cliente@test.com', nombreRol: 'CLIENTE' } as any;
  const nonClienteUser = { id: 2, correo: 'admin@test.com', nombreRol: 'ADMIN' } as any;

  it('should reject non-CLIENTE users for obtenerMisReservas', async () => {
    const reservasService = {
      findByClienteFacturaOrCorreo: jest.fn(),
    } as any;
    const controller = new ReservasController(reservasService);

    await expect(controller.obtenerMisReservas(nonClienteUser)).rejects.toThrow(UnauthorizedException);
    expect(reservasService.findByClienteFacturaOrCorreo).not.toHaveBeenCalled();
  });

  it('should allow CLIENTE users to fetch their own reservations', async () => {
    const reservasService = {
      findByClienteFacturaOrCorreo: jest.fn().mockResolvedValue([{ id: 1 }]),
    } as any;
    const controller = new ReservasController(reservasService);

    const result = await controller.obtenerMisReservas(clienteUser);

    expect(result).toEqual([{ id: 1 }]);
    expect(reservasService.findByClienteFacturaOrCorreo).toHaveBeenCalledWith(1, 'cliente@test.com');
  });

  it('should reject non-CLIENTE users for crearComoCliente', async () => {
    const reservasService = {
      crearParaCliente: jest.fn(),
    } as any;
    const controller = new ReservasController(reservasService);

    await expect(controller.crearComoCliente(nonClienteUser, {} as any)).rejects.toThrow(UnauthorizedException);
    expect(reservasService.crearParaCliente).not.toHaveBeenCalled();
  });
});
