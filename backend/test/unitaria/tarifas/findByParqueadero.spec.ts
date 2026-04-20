import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createTestingModule } from './tarifas.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('TarifasService - findByParqueadero', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // findByParqueadero()
  // ==========================================================================
  describe('findByParqueadero', () => {

    it('CS0001 - retorna tarifas cuando idParqueadero es válido', async () => {
      // Arrange
      const { service, tarifaRepository, parqueaderosService } =
        await createTestingModule();

      const parqueaderoMock = { id: 1 };
      const tarifasMock     = [{ id: 1 }, { id: 2 }];

      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      tarifaRepository.find.resolves(tarifasMock);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(parqueaderosService.findParqueaderoById.calledWith(1)).to.be.true;

      expect(
        tarifaRepository.find.calledWith({
          where:     { parqueadero: { id: 1 } },
          relations: ['parqueadero', 'tipoVehiculo'],
        }),
      ).to.be.true;

      expect(result)
        .to.exist
        .and.to.equal(tarifasMock);
    });

    it('CS0002 - lanza BadRequestException cuando idParqueadero es inválido', async () => {
      // Arrange
      const { service, tarifaRepository, parqueaderosService } =
        await createTestingModule();

      // Act
      const action = service.findByParqueadero(0);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException);

      expect(parqueaderosService.findParqueaderoById.called).to.be.false;
      expect(tarifaRepository.find.called).to.be.false;
    });

    it('CS0003 - retorna tarifas cuando parqueadero existe', async () => {
      // Arrange
      const { service, tarifaRepository, parqueaderosService } =
        await createTestingModule();

      const parqueaderoMock = { id: 1 };
      const tarifasMock     = [{ id: 1 }];

      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      tarifaRepository.find.resolves(tarifasMock);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(parqueaderosService.findParqueaderoById.calledWith(1)).to.be.true;
      expect(tarifaRepository.find.called).to.be.true;

      expect(result)
        .to.exist
        .and.to.equal(tarifasMock);
    });

    it('CS0004 - lanza NotFoundException cuando parqueadero NO existe', async () => {
      // Arrange
      const { service, tarifaRepository, parqueaderosService } =
        await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves(null);

      // Act
      const action = service.findByParqueadero(1);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);

      expect(parqueaderosService.findParqueaderoById.calledWith(1)).to.be.true;
      expect(tarifaRepository.find.called).to.be.false;
    });

  });

});