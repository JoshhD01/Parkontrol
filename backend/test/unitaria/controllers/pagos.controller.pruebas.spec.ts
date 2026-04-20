import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createTestingModule } from './pagos.controller.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('PagosController', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('PC-CR-001 - crea pago correctamente con dto válido', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto     = { idReserva: 1, idMetodoPago: 1 };
      const pagoMock = { id: 1, monto: 21000 };

      sandbox.stub(service, 'crear').resolves(pagoMock as any);

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

    it('PC-CR-002 - dto con idReserva como string propaga error del servicio', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto = { idReserva: 'abc' as any, idMetodoPago: 1 };

      sandbox.stub(service, 'crear').rejects(new Error('idReserva inválido'));

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('idReserva inválido');
    });

    it('PC-CR-003 - dto con idMetodoPago como string propaga error del servicio', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 'abc' as any };

      sandbox.stub(service, 'crear').rejects(new Error('idMetodoPago inválido'));

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('idMetodoPago inválido');
    });

  });

  // ==========================================================================
  // obtenerPorParqueadero()
  // ==========================================================================
  describe('obtenerPorParqueadero', () => {

    it('PC-OPP-001 - retorna pagos cuando existen para el parqueadero', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const pagosMock = [{ id: 1 }, { id: 2 }];
      sandbox.stub(service, 'findByParqueadero').resolves(pagosMock as any);

      // Act
      const result = await controller.obtenerPorParqueadero(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(2);
    });

    it('PC-OPP-002 - retorna array vacío cuando no hay pagos para el parqueadero', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      sandbox.stub(service, 'findByParqueadero').resolves([]);

      // Act
      const result = await controller.obtenerPorParqueadero(999);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // obtenerMisPagos()
  // ==========================================================================
  describe('obtenerMisPagos', () => {

    it('PC-OMP-001 - retorna pagos cuando usuario tiene rol CLIENTE', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const user     = { id: 1, nombreRol: 'CLIENTE', correo: 'cliente@test.com' } as any;
      const pagosMock = [{ id: 1 }, { id: 2 }];

      sandbox.stub(service, 'findByCliente').resolves(pagosMock as any);

      // Act
      const result = await controller.obtenerMisPagos(user);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(2);
    });

    it('PC-OMP-002 - lanza UnauthorizedException cuando usuario tiene rol ADMIN', async () => {
      // Arrange
      const { controller } = await createTestingModule();

      const user = { id: 1, nombreRol: 'ADMIN', correo: 'admin@test.com' } as any;

      // Act
      const action = controller.obtenerMisPagos(user);

      // Assert
      await expect(action).to.be.rejectedWith(
        UnauthorizedException,
        'Acceso exclusivo para clientes autenticados',
      );
    });

    it('PC-OMP-003 - lanza UnauthorizedException cuando usuario tiene rol OPERADOR', async () => {
      // Arrange
      const { controller } = await createTestingModule();

      const user = { id: 1, nombreRol: 'OPERADOR', correo: 'op@test.com' } as any;

      // Act
      const action = controller.obtenerMisPagos(user);

      // Assert
      await expect(action).to.be.rejectedWith(UnauthorizedException);
    });

    it('PC-OMP-004 - retorna lista vacía cuando cliente no tiene pagos', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const user = { id: 1, nombreRol: 'CLIENTE', correo: 'cliente@test.com' } as any;

      sandbox.stub(service, 'findByCliente').resolves([]);

      // Act
      const result = await controller.obtenerMisPagos(user);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // obtenerPorReserva()
  // ==========================================================================
  describe('obtenerPorReserva', () => {

    it('PC-OPR-001 - retorna pago cuando existe para la reserva', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const pagoMock = { id: 1, reserva: { id: 5 } };
      sandbox.stub(service, 'findByReserva').resolves(pagoMock as any);

      // Act
      const result = await controller.obtenerPorReserva(5);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

    it('PC-OPR-002 - lanza NotFoundException cuando no existe pago para la reserva', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      sandbox.stub(service, 'findByReserva').resolves(null);

      // Act
      const action = controller.obtenerPorReserva(999);

      // Assert
      await expect(action).to.be.rejectedWith(
        NotFoundException,
        'No existe pago para la reserva con id: 999',
      );
    });

  });

  // ==========================================================================
  // obtenerPorId()
  // ==========================================================================
  describe('obtenerPorId', () => {

    it('PC-OPI-001 - retorna pago cuando id es válido y existe', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const pagoMock = { id: 1, monto: 21000 };
      sandbox.stub(service, 'findPagoById').resolves(pagoMock as any);

      // Act
      const result = await controller.obtenerPorId(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

    it('PC-OPI-002 - lanza NotFoundException cuando pago no existe', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      sandbox.stub(service, 'findPagoById').rejects(
        new NotFoundException('No existe pago con id: 999'),
      );

      // Act
      const action = controller.obtenerPorId(999);

      // Assert
      await expect(action).to.be.rejectedWith(
        NotFoundException,
        'No existe pago con id: 999',
      );
    });

  });

});