import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FacturacionController } from './facturacion.controller';
import { FacturacionService } from './facturacion.service';

type FacturacionServiceDouble = {
  findMisFacturas: jest.Mock;
  crearCliente: jest.Mock;
  crearFactura: jest.Mock;
  findByPago: jest.Mock;
  obtenerClientes: jest.Mock;
};

describe('FacturacionController', () => {
  let controller: FacturacionController;
  let facturacionService: FacturacionServiceDouble;

  const buildFacturacionServiceDouble = (): FacturacionServiceDouble => ({
    findMisFacturas: jest.fn(),
    crearCliente: jest.fn(),
    crearFactura: jest.fn(),
    findByPago: jest.fn(),
    obtenerClientes: jest.fn(),
  });

  beforeEach(async () => {
    facturacionService = buildFacturacionServiceDouble();

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

  describe('obtenerFacturasCliente', () => {
    it('C1 rol distinto de CLIENTE lanza Unauthorized', async () => {
      const userDummy = {
        id: 1,
        correo: 'u@x.com',
        nombreRol: 'ADMIN',
      } as any;

      await expect(controller.obtenerFacturasCliente(userDummy)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(facturacionService.findMisFacturas).not.toHaveBeenCalled();
    });

    it('C2 rol CLIENTE delega en findMisFacturas', async () => {
      const userStub = {
        id: 5,
        correo: 'cliente@x.com',
        nombreRol: 'CLIENTE',
      } as any;

      const facturasFake = [{ id: 10 }];
      facturacionService.findMisFacturas.mockResolvedValue(facturasFake);

      const result = await controller.obtenerFacturasCliente(userStub);

      expect(facturacionService.findMisFacturas).toHaveBeenCalledWith(5);
      expect(result).toEqual(facturasFake);
    });
  });

  describe('obtenerPorPago', () => {
    it('C1 si service retorna null lanza NotFound', async () => {
      facturacionService.findByPago.mockResolvedValue(null);

      await expect(controller.obtenerPorPago(99)).rejects.toThrow(NotFoundException);
    });

    it('C2 si service retorna factura responde OK', async () => {
      const facturaStub = { id: 4, tipoFactura: 'NORMAL' };
      facturacionService.findByPago.mockResolvedValue(facturaStub);

      const result = await controller.obtenerPorPago(4);

      expect(result).toEqual(facturaStub);
      expect(facturacionService.findByPago).toHaveBeenCalledWith(4);
    });
  });
});
