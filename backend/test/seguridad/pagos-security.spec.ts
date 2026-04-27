import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PagosController } from 'src/controller/pagos/pagos.controller';

describe('PagosController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject non-CLIENTE users for obtenerMisPagos', async () => {
    const pagosService = {
      findByCliente: jest.fn(),
    } as any;
    const controller = new PagosController(pagosService);

    await expect(
      controller.obtenerMisPagos({ id: 1, correo: 'test@example.com', nombreRol: 'ADMIN' } as any),
    ).rejects.toThrow(UnauthorizedException);
    expect(pagosService.findByCliente).not.toHaveBeenCalled();
  });

  it('should fetch payments for CLIENTE users', async () => {
    const pagosService = {
      findByCliente: jest.fn().mockResolvedValue([{ id: 1 }]),
    } as any;
    const controller = new PagosController(pagosService);

    const result = await controller.obtenerMisPagos({ id: 1, correo: 'client@example.com', nombreRol: 'CLIENTE' } as any);

    expect(result).toEqual([{ id: 1 }]);
    expect(pagosService.findByCliente).toHaveBeenCalledWith(1, 'client@example.com');
  });

  it('should throw NotFoundException when payment by reserva does not exist', async () => {
    const pagosService = {
      findByReserva: jest.fn().mockResolvedValue(null),
    } as any;
    const controller = new PagosController(pagosService);

    await expect(controller.obtenerPorReserva(2)).rejects.toThrow(NotFoundException);
    expect(pagosService.findByReserva).toHaveBeenCalledWith(2);
  });
});
