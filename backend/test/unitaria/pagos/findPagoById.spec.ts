import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from './pagos.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('PagosService - findPagoById', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // findPagoById()
  // ==========================================================================
  describe('findPagoById', () => {

    it('ESC00029 / CS00022 - encuentra un pago por ID cuando existe', async () => {
      // Arrange
      const { service, pagoRepository } = await createTestingModule();

      const pagoMock = { id: 1, monto: 5000, fechaPago: new Date() };
      pagoRepository.findOne.resolves(pagoMock);

      // Act
      const result = await service.findPagoById(1);

      // Assert
      expect(result).to.deep.equal(pagoMock);
      expect(
        pagoRepository.findOne.calledWith(
          sinon.match({
            where: { id: 1 },
            relations: sinon.match.array.deepIncludes('reserva').and(
              sinon.match.array.deepIncludes('metodoPago'),
            ),
          }),
        ),
      ).to.be.true;
    });

    it('ESC00030 / CS00023 - lanza NotFoundException si el pago no existe', async () => {
      // Arrange
      const { service, pagoRepository } = await createTestingModule();

      pagoRepository.findOne.resolves(null);

      // Act
      const action = service.findPagoById(999);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException, 'No existe pago con id: 999');
    });

    it('ESC00031 / CS00024 - propaga error si la consulta falla', async () => {
      // Arrange
      const { service, pagoRepository } = await createTestingModule();

      pagoRepository.findOne.rejects(new Error('Error de base de datos'));

      // Act
      const action = service.findPagoById(1);

      // Assert
      await expect(action).to.be.rejectedWith('Error de base de datos');
    });

  });

});