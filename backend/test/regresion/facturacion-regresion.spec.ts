import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/facturacion/facturacion.service.module';

describe('FacturacionService Regression Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearCliente - Regression', () => {
    it('should create cliente with valid data', async () => {
      const { service, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123',
        correo: 'test@test.com',
        idUsuario: 1,
      };

      const usuario = { id: 1 };
      const cliente = { id: 1, ...dto };
      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns(cliente);
      clienteFacturaRepository.save.resolves(cliente);

      const result = await service.crearCliente(dto as any);

      expect(result).toEqual(cliente);
    });

    it('should update existing cliente', async () => {
      const { service, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123',
        correo: 'test@test.com',
        idUsuario: 2,
      };

      const existing = { id: 1, tipoDocumento: 'cc', numeroDocumento: '123', correo: 'old@test.com', usuario: { id: 1 } };
      clienteFacturaRepository.findOne.resolves(existing);
      clienteFacturaRepository.save.resolves({ ...existing, correo: 'test@test.com', usuario: { id: 2 } });

      const result = await service.crearCliente(dto as any);

      expect(result.correo).toBe('test@test.com');
    });
  });

  describe('crearFactura - Regression', () => {
    it('should create factura successfully', async () => {
      const { service, facturaRepository, clienteFacturaRepository, pagosService } = await createTestingModule();

      const dto = { idClienteFactura: 1, idPago: 1 };
      const cliente = { id: 1 };
      const pago = { id: 1, reserva: { vehiculo: { tipoVehiculo: { id: 1 } } } };

      clienteFacturaRepository.findOne.resolves(cliente);
      pagosService.findPagoById.resolves(pago);
      facturaRepository.create.returns({ id: 1 });
      facturaRepository.save.resolves({ id: 1 });

      const result = await service.crearFactura(dto as any);

      expect(result.id).toBe(1);
    });
  });

  describe('findByPago - Regression', () => {
    it('should return facturas for pago', async () => {
      const { service, facturaRepository } = await createTestingModule();

      const facturas = [{ id: 1 }];
      facturaRepository.find.resolves(facturas);

      const result = await service.findByPago(1);

      expect(result).toEqual(facturas);
    });
  });

  describe('obtenerPorPago - Regression', () => {
    it('should return factura for pago', async () => {
      const { service, facturaRepository } = await createTestingModule();

      const factura = { id: 1 };
      facturaRepository.findOne.resolves(factura);

      const result = await service.obtenerPorPago(1);

      expect(result).toEqual(factura);
    });

    it('should throw NotFoundException if no factura', async () => {
      const { service, facturaRepository } = await createTestingModule();

      facturaRepository.findOne.resolves(null);

      await expect(service.obtenerPorPago(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('obtenerClientes - Regression', () => {
    it('should return clientes', async () => {
      const { service, clienteFacturaRepository } = await createTestingModule();

      const clientes = [{ id: 1 }];
      clienteFacturaRepository.find.resolves(clientes);

      const result = await service.obtenerClientes();

      expect(result).toEqual(clientes);
    });
  });

  describe('findByClienteFactura - Regression', () => {
    it('should return facturas for cliente', async () => {
      const { service, facturaRepository } = await createTestingModule();

      const facturas = [{ id: 1 }];
      facturaRepository.find.resolves(facturas);

      const result = await service.findByClienteFactura(1);

      expect(result).toEqual(facturas);
    });
  });

  describe('findMisFacturas - Regression', () => {
    it('should return facturas for user', async () => {
      const { service, clienteFacturaRepository, facturaRepository } = await createTestingModule();

      const cliente = { id: 1, usuario: { id: 1 } };
      const facturas = [{ id: 1 }];
      clienteFacturaRepository.find.resolves([cliente]);
      facturaRepository.find.resolves(facturas);

      const result = await service.findMisFacturas(1);

      expect(result).toEqual(facturas);
    });
  });
});