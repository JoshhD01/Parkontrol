import { NotFoundException } from '@nestjs/common';
import { FacturacionController } from 'src/controller/facturacion/facturacion.controller';

describe('FacturacionController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a client invoice through the FacturacionService', async () => {
    const facturacionService = {
      crearCliente: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new FacturacionController(facturacionService);

    const result = await controller.crearCliente({} as any);

    expect(result).toEqual({ id: 1 });
    expect(facturacionService.crearCliente).toHaveBeenCalledWith({} as any);
  });

  it('should throw NotFoundException when invoice by payment id is missing', async () => {
    const facturacionService = {
      findByPago: jest.fn().mockResolvedValue(null),
    } as any;
    const controller = new FacturacionController(facturacionService);

    await expect(controller.obtenerPorPago(1)).rejects.toThrow(NotFoundException);
    expect(facturacionService.findByPago).toHaveBeenCalledWith(1);
  });
});
