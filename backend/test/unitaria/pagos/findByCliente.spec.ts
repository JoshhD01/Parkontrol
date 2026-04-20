import { createTestingModule } from './pagos.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('PagosService - findByCliente', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ─── Helper ────────────────────────────────────────────────────────────────
  function makeQueryBuilder(overrides: Record<string, any> = {}) {
    const qb: Record<string, any> = {};
    const methods = ['leftJoinAndSelect', 'leftJoin', 'where', 'orWhere', 'orderBy'];

    methods.forEach((m) => {
      qb[m] = sinon.stub().returns(qb);
    });

    qb.getMany = sinon.stub().resolves(overrides.getMany ?? []);

    return qb;
  }

  // ==========================================================================
  // findByCliente()
  // ==========================================================================
  describe('findByCliente', () => {

    it('ESC00032 / CS00025 - encuentra pagos por ID de cliente y correo', async () => {
      // Arrange
      const { service, pagoRepository } = await createTestingModule();

      const qb = makeQueryBuilder();
      pagoRepository.createQueryBuilder.returns(qb);

      // Act
      await service.findByCliente(1, 'test@test.com');

      // Assert
      expect(pagoRepository.createQueryBuilder.calledWith('pago')).to.be.true;
      expect(qb.leftJoinAndSelect.callCount).to.equal(6);
      expect(qb.leftJoin.calledWith('reserva.clienteFactura', 'clienteFactura')).to.be.true;
      expect(
        qb.where.calledWith(
          'clienteFactura.ID_CLIENTE_FACTURA = :idClienteFactura',
          { idClienteFactura: 1 },
        ),
      ).to.be.true;
      expect(qb.orWhere.called).to.be.true;
      expect(qb.orderBy.calledWith('pago.FECHA_PAGO', 'DESC')).to.be.true;
      expect(qb.getMany.called).to.be.true;
    });

    it('ESC00033 / CS00026 - normaliza el correo (trim y lowercase) para la búsqueda', async () => {
      // Arrange
      const { service, pagoRepository } = await createTestingModule();

      const qb = makeQueryBuilder();
      pagoRepository.createQueryBuilder.returns(qb);

      // Act
      await service.findByCliente(1, '  TEST@TEST.COM  ');

      // Assert
      expect(
        qb.orWhere.calledWith(
          'LOWER(TRIM(clienteFactura.CORREO)) = LOWER(TRIM(:correoNormalizado))',
          { correoNormalizado: 'test@test.com' },
        ),
      ).to.be.true;
    });

    it('ESC00034 / CS00027 - retorna array vacío si no hay pagos para el usuario', async () => {
      // Arrange
      const { service, pagoRepository } = await createTestingModule();

      const qb = makeQueryBuilder();
      pagoRepository.createQueryBuilder.returns(qb);

      // Act
      const result = await service.findByCliente(999, 'noexiste@test.com');

      // Assert
      expect(result).to.be.an('array').that.is.empty;
      expect(qb.getMany.called).to.be.true;
    });

    it('ESC00035 / CS00028 - propaga error si la consulta falla', async () => {
      // Arrange
      const { service, pagoRepository } = await createTestingModule();

      const qb = makeQueryBuilder();
      qb.getMany = sinon.stub().rejects(new Error('Error DB'));
      pagoRepository.createQueryBuilder.returns(qb);

      // Act
      const action = service.findByCliente(1, 'test@test.com');

      // Assert
      await expect(action).to.be.rejectedWith('Error DB');
    });

    it('ESC00036 / CS00029 - construye correctamente la consulta SQL para buscar pagos', async () => {
      // Arrange
      const { service, pagoRepository } = await createTestingModule();

      const qb = makeQueryBuilder();
      pagoRepository.createQueryBuilder.returns(qb);

      // Act
      await service.findByCliente(1, 'test@test.com');

      // Assert
      expect(qb.leftJoinAndSelect.getCall(0).calledWith('pago.reserva', 'reserva')).to.be.true;
      expect(qb.leftJoinAndSelect.getCall(1).calledWith('reserva.vehiculo', 'vehiculo')).to.be.true;
      expect(qb.leftJoinAndSelect.getCall(2).calledWith('vehiculo.tipoVehiculo', 'tipoVehiculo')).to.be.true;
      expect(qb.leftJoinAndSelect.getCall(3).calledWith('reserva.celda', 'celda')).to.be.true;
      expect(qb.leftJoinAndSelect.getCall(4).calledWith('celda.parqueadero', 'parqueadero')).to.be.true;
      expect(qb.leftJoinAndSelect.getCall(5).calledWith('pago.metodoPago', 'metodoPago')).to.be.true;
      expect(qb.leftJoin.calledWith('reserva.clienteFactura', 'clienteFactura')).to.be.true;
      expect(qb.orderBy.calledWith('pago.FECHA_PAGO', 'DESC')).to.be.true;
    });

  });

});