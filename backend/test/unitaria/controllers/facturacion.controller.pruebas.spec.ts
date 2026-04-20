import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createTestingModule } from './facturacion.controller.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('FacturacionController', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // obtenerFacturasCliente()
  // ==========================================================================
  describe('obtenerFacturasCliente', () => {

    it('FC-OFC-001 - retorna facturas cuando usuario tiene rol CLIENTE', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const user = { id: 1, nombreRol: 'CLIENTE', correo: 'cliente@test.com' } as any;
      const facturasMock = [{ id: 1 }, { id: 2 }];

      sandbox.stub(service, 'findMisFacturas').resolves(facturasMock);

      // Act
      const result = await controller.obtenerFacturasCliente(user);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(2);
    });

    it('FC-OFC-002 - lanza UnauthorizedException cuando usuario no tiene rol CLIENTE', async () => {
      // Arrange
      const { controller } = await createTestingModule();

      const user = { id: 1, nombreRol: 'ADMIN', correo: 'admin@test.com' } as any;

      // Act
      const action = controller.obtenerFacturasCliente(user);

      // Assert
      await expect(action).to.be.rejectedWith(
        UnauthorizedException,
        'Acceso exclusivo para clientes autenticados',
      );
    });

    it('FC-OFC-003 - retorna lista vacía cuando cliente no tiene facturas', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const user = { id: 1, nombreRol: 'CLIENTE', correo: 'cliente@test.com' } as any;

      sandbox.stub(service, 'findMisFacturas').resolves([]);

      // Act
      const result = await controller.obtenerFacturasCliente(user);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

    it('FC-OFC-004 - lanza UnauthorizedException cuando rol es OPERADOR', async () => {
      // Arrange
      const { controller } = await createTestingModule();

      const user = { id: 1, nombreRol: 'OPERADOR', correo: 'op@test.com' } as any;

      // Act
      const action = controller.obtenerFacturasCliente(user);

      // Assert
      await expect(action).to.be.rejectedWith(UnauthorizedException);
    });

  });

  // ==========================================================================
  // crearCliente()
  // ==========================================================================
  describe('crearCliente', () => {

    it('FC-CC-001 - crea cliente correctamente con dto válido completo', async () => {
      // Arrange
      const { controller, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento:   'CC',
        numeroDocumento: '123456789',
        correo:          'test@test.com',
        idUsuario:       1,
      };

      const clienteMock = { id: 10, correo: 'test@test.com' };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns(clienteMock);
      clienteFacturaRepository.save.resolves(clienteMock);

      // Act
      const result = await controller.crearCliente(dto as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 10);
    });

    it('FC-CC-002 - crea cliente correctamente sin idUsuario (campo opcional)', async () => {
      // Arrange
      const { controller, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento:   'CC',
        numeroDocumento: '123456789',
        correo:          'test@test.com',
      };

      const clienteMock = { id: 11, correo: 'test@test.com' };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns(clienteMock);
      clienteFacturaRepository.save.resolves(clienteMock);

      // Act
      const result = await controller.crearCliente(dto as any);

      // Assert
      expect(result).to.exist.and.to.have.property('id', 11);
    });

    it('FC-CC-003 - crea cliente con tipoDocumento NIT', async () => {
      // Arrange
      const { controller, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento:   'NIT',
        numeroDocumento: '900123456-7',
        correo:          'empresa@test.com',
      };

      const clienteMock = { id: 12, correo: 'empresa@test.com' };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns(clienteMock);
      clienteFacturaRepository.save.resolves(clienteMock);

      // Act
      const result = await controller.crearCliente(dto as any);

      // Assert
      expect(result).to.exist.and.to.have.property('id', 12);
    });

    it('FC-CC-004 - crea cliente con tipoDocumento PAS', async () => {
      // Arrange
      const { controller, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento:   'PAS',
        numeroDocumento: 'AB12345',
        correo:          'extranjero@test.com',
      };

      const clienteMock = { id: 13, correo: 'extranjero@test.com' };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns(clienteMock);
      clienteFacturaRepository.save.resolves(clienteMock);

      // Act
      const result = await controller.crearCliente(dto as any);

      // Assert
      expect(result).to.exist.and.to.have.property('id', 13);
    });

    it('FC-CC-005 - actualiza cliente existente cuando ya existe en base de datos', async () => {
      // Arrange
      const { controller, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento:   'CC',
        numeroDocumento: '123456789',
        correo:          'nuevo@test.com',
      };

      const clienteExistente = {
        id:              10,
        correo:          'viejo@test.com',
        tipoDocumento:   'CC',
        numeroDocumento: '123456789',
      };

      const clienteActualizado = { ...clienteExistente, correo: 'nuevo@test.com' };

      clienteFacturaRepository.findOne.resolves(clienteExistente);
      clienteFacturaRepository.save.resolves(clienteActualizado);

      // Act
      const result = await controller.crearCliente(dto as any);

      // Assert
      expect(result).to.have.property('correo', 'nuevo@test.com');
    });

  });

  // ==========================================================================
  // crearFactura()
  // ==========================================================================
  describe('crearFactura', () => {

    it('FC-CF-001 - crea factura correctamente con idPago e idClienteFactura', async () => {
      // Arrange
      const { controller, facturaRepository, pagosService, clienteFacturaRepository } =
        await createTestingModule();

      const dto = { idPago: 1, idClienteFactura: 5 };

      const pagoMock    = { id: 1, reserva: null };
      const facturaMock = { id: 100, pago: pagoMock };

      facturaRepository.findOne.resolves(null);
      pagosService.findPagoById.resolves(pagoMock);
      clienteFacturaRepository.findOne.resolves({ id: 5 });
      facturaRepository.create.returns(facturaMock);
      facturaRepository.save.resolves(facturaMock);

      // Act
      const result = await controller.crearFactura(dto as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 100);
    });

    it('FC-CF-002 - crea factura correctamente sin idClienteFactura (campo opcional)', async () => {
      // Arrange
      const { controller, facturaRepository, pagosService } =
        await createTestingModule();

      const dto = { idPago: 1 };

      const pagoMock    = { id: 1, reserva: { clienteFactura: null } };
      const facturaMock = { id: 101, pago: pagoMock };

      facturaRepository.findOne.resolves(null);
      pagosService.findPagoById.resolves(pagoMock);
      facturaRepository.create.returns(facturaMock);
      facturaRepository.save.resolves(facturaMock);

      // Act
      const result = await controller.crearFactura(dto as any);

      // Assert
      expect(result).to.exist.and.to.have.property('id', 101);
    });

    it('FC-CF-003 - retorna factura existente cuando ya existe para el pago', async () => {
      // Arrange
      const { controller, facturaRepository } = await createTestingModule();

      const dto         = { idPago: 1 };
      const facturaMock = { id: 50, pago: { id: 1 } };

      facturaRepository.findOne.resolves(facturaMock);

      // Act
      const result = await controller.crearFactura(dto as any);

      // Assert
      expect(result).to.exist;
      expect(facturaRepository.save.called).to.be.false;
    });

  });

  // ==========================================================================
  // obtenerPorPago()
  // ==========================================================================
  describe('obtenerPorPago', () => {

    it('FC-OPP-001 - retorna factura cuando existe para el pago', async () => {
      // Arrange
      const { controller, facturaRepository } = await createTestingModule();

      const facturaMock = { id: 1, pago: { id: 5 } };
      facturaRepository.findOne.resolves(facturaMock);

      // Act
      const result = await controller.obtenerPorPago(5);

      // Assert
      expect(result).to.exist;
    });

    it('FC-OPP-002 - lanza NotFoundException cuando no existe factura para el pago', async () => {
      // Arrange
      const { controller, facturaRepository } = await createTestingModule();

      facturaRepository.findOne.resolves(null);

      // Act
      const action = controller.obtenerPorPago(999);

      // Assert
      await expect(action).to.be.rejectedWith(
        NotFoundException,
        'No existe factura para el pago con id: 999',
      );
    });

  });

  // ==========================================================================
  // obtenerClientes()
  // ==========================================================================
  describe('obtenerClientes', () => {

    it('FC-OCL-001 - retorna lista de clientes cuando existen registros', async () => {
      // Arrange
      const { controller, clienteFacturaRepository } = await createTestingModule();

      clienteFacturaRepository.find.resolves([
        { id: 1, correo: 'a@test.com' },
        { id: 2, correo: 'b@test.com' },
      ]);

      // Act
      const result = await controller.obtenerClientes();

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(2);
    });

    it('FC-OCL-002 - retorna lista vacía cuando no hay clientes', async () => {
      // Arrange
      const { controller, clienteFacturaRepository } = await createTestingModule();

      clienteFacturaRepository.find.resolves([]);

      // Act
      const result = await controller.obtenerClientes();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

});