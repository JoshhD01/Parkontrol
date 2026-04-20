import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createTestingModule } from './tarifas.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('TarifasService - findTarifaById', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // findTarifaById()
  // ==========================================================================
  describe('findTarifaById', () => {

    it('CS0001 - retorna tarifa cuando id es válido', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id         = 1;
      const tarifaMock = { id, parqueadero: {}, tipoVehiculo: {} };

      tarifaRepository.findOne.resolves(tarifaMock);

      // Act
      const result = await service.findTarifaById(id);

      // Assert
      expect(
        tarifaRepository.findOne.calledWith({
          where:     { id },
          relations: ['parqueadero', 'tipoVehiculo'],
        }),
      ).to.be.true;

      expect(result)
        .to.exist
        .and.to.equal(tarifaMock);
    });

    it('CS0002 - lanza BadRequestException cuando id es inválido', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      // Act
      const action = service.findTarifaById(0);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException);
      expect(tarifaRepository.findOne.called).to.be.false;
    });

    it('CS0003 - retorna tarifa cuando existe en base de datos', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id         = 1;
      const tarifaMock = { id, parqueadero: {}, tipoVehiculo: {} };

      tarifaRepository.findOne.resolves(tarifaMock);

      // Act
      const result = await service.findTarifaById(id);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

    it('CS0004 - lanza NotFoundException cuando tarifa NO existe', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id = 1;

      tarifaRepository.findOne.resolves(null);

      // Act
      const action = service.findTarifaById(id);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);

      expect(
        tarifaRepository.findOne.calledWith({
          where:     { id },
          relations: ['parqueadero', 'tipoVehiculo'],
        }),
      ).to.be.true;
    });

  });

});