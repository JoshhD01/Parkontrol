import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createTestingModule } from './tarifas.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('TarifasService - findByParqueaderoYTipo', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // findByParqueaderoYTipo()
  // ==========================================================================
  describe('findByParqueaderoYTipo', () => {

    it('CS0001 - retorna tarifa cuando idParqueadero e idTipoVehiculo son válidos', async () => {
      // Arrange
      const { service, tarifaRepository, parqueaderosService, tipoVehiculoRepository } =
        await createTestingModule();

      const tarifaMock = { id: 1 };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves({ id: 1 });
      tarifaRepository.findOne.resolves(tarifaMock);

      // Act
      const result = await service.findByParqueaderoYTipo(1, 1);

      // Assert
      expect(result)
        .to.exist
        .and.to.equal(tarifaMock);
    });

    it('CS0002 - lanza BadRequestException cuando idParqueadero es inválido', async () => {
      // Arrange
      const { service } = await createTestingModule();

      // Act
      const action = service.findByParqueaderoYTipo(0, 1);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException);
    });

    it('CS0003 - continúa ejecución cuando idTipoVehiculo es válido', async () => {
      // Arrange
      const { service, tarifaRepository, parqueaderosService, tipoVehiculoRepository } =
        await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves({ id: 1 });
      tarifaRepository.findOne.resolves({ id: 1 });

      // Act
      const result = await service.findByParqueaderoYTipo(1, 1);

      // Assert
      expect(result).to.exist;
    });

    it('CS0004 - lanza BadRequestException cuando idTipoVehiculo es inválido', async () => {
      // Arrange
      const { service } = await createTestingModule();

      // Act
      const action = service.findByParqueaderoYTipo(1, 0);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException);
    });

    it('CS0005 - continúa cuando parqueadero existe', async () => {
      // Arrange
      const { service, tarifaRepository, parqueaderosService, tipoVehiculoRepository } =
        await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves({ id: 1 });
      tarifaRepository.findOne.resolves({ id: 1 });

      // Act
      const result = await service.findByParqueaderoYTipo(1, 1);

      // Assert
      expect(parqueaderosService.findParqueaderoById.calledWith(1)).to.be.true;
      expect(result).to.exist;
    });

    it('CS0006 - lanza NotFoundException cuando parqueadero NO existe', async () => {
      // Arrange
      const { service, parqueaderosService } = await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves(null);

      // Act
      const action = service.findByParqueaderoYTipo(1, 1);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('CS0007 - continúa cuando tipoVehiculo existe', async () => {
      // Arrange
      const { service, tarifaRepository, parqueaderosService, tipoVehiculoRepository } =
        await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves({ id: 1 });
      tarifaRepository.findOne.resolves({ id: 1 });

      // Act
      const result = await service.findByParqueaderoYTipo(1, 1);

      // Assert
      expect(tipoVehiculoRepository.findOne.calledWith({ where: { id: 1 } })).to.be.true;
      expect(result).to.exist;
    });

    it('CS0008 - lanza NotFoundException cuando tipoVehiculo NO existe', async () => {
      // Arrange
      const { service, parqueaderosService, tipoVehiculoRepository } =
        await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves(null);

      // Act
      const action = service.findByParqueaderoYTipo(1, 1);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

});