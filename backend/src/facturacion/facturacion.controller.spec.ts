import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FacturacionController } from './facturacion.controller';
import { FacturacionService } from './facturacion.service';

describe('FacturacionController', () => {
  let controller: FacturacionController;

  const facturacionService = {
    findMisFacturas: jest.fn(),
    crearCliente: jest.fn(),
    crearFactura: jest.fn(),
    findByPago: jest.fn(),
    obtenerClientes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturacionController],
      providers: [
        {
          provide: FacturacionService,
          useValue: facturacionService,
        },
      ],
    }).compile();

    controller = module.get<FacturacionController>(FacturacionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('5) obtenerFacturasCliente caminos C1 y parte de C3/C5/C6', () => {
    it('C1 - rol distinto de CLIENTE => Unauthorized', async () => {
      await expect(
        controller.obtenerFacturasCliente({
          id: 1,
          correo: 'u@x.com',
          nombreRol: 'ADMIN',
        } as any),
      ).rejects.toThrow(UnauthorizedException);

      expect(facturacionService.findMisFacturas).not.toHaveBeenCalled();
    });

    it('Rol CLIENTE => delega a service.findMisFacturas con id/correo', async () => {
      facturacionService.findMisFacturas.mockResolvedValue([{ id: 10 }]);

      const result = await controller.obtenerFacturasCliente({
        id: 5,
        correo: 'cliente@x.com',
        nombreRol: 'CLIENTE',
      } as any);

      expect(facturacionService.findMisFacturas).toHaveBeenCalledWith(5);
      expect(result).toEqual([{ id: 10 }]);
    });
  });

  describe('4) obtenerPorPago caminos C1-C2', () => {
    it('C1 - service retorna null => NotFound', async () => {
      facturacionService.findByPago.mockResolvedValue(null);

      await expect(controller.obtenerPorPago(99)).rejects.toThrow(NotFoundException);
    });

    it('C2 - service retorna factura => respuesta OK', async () => {
      const factura = { id: 4, tipoFactura: 'NORMAL' };
      facturacionService.findByPago.mockResolvedValue(factura);

      const result = await controller.obtenerPorPago(4);

      expect(result).toEqual(factura);
      expect(facturacionService.findByPago).toHaveBeenCalledWith(4);
    });
  });
});
