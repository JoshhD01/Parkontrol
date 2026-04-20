import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from './tarifas.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('TarifasService - actualizar', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // actualizar()
  // ==========================================================================
  describe('actualizar', () => {

    it('CS0001 - actualiza correctamente cuando tarifa existe', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id = 1;

      const tarifaMock          = { id, precioFraccionHora: 100, precioHoraAdicional: 50, parqueadero: {}, tipoVehiculo: {} };
      const tarifaActualizadaMock = { ...tarifaMock };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.findOne.onSecondCall().resolves(tarifaActualizadaMock);
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      const result = await service.actualizar(id, {} as any);

      // Assert
      expect(
        tarifaRepository.findOne.calledWith({
          where: { id },
          relations: ['parqueadero', 'tipoVehiculo'],
        }),
      ).to.be.true;

      expect(result)
        .to.exist
        .and.to.equal(tarifaActualizadaMock);
    });

    it('CS0002 - lanza NotFoundException cuando tarifa NO existe', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      tarifaRepository.findOne.resolves(null);

      // Act
      const action = service.actualizar(1, {} as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
      expect(tarifaRepository.save.called).to.be.false;
    });

    it('CS0003 - actualiza precioFraccionHora cuando viene definido', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id        = 1;
      const tarifaMock = { id, precioFraccionHora: 100, precioHoraAdicional: 50, parqueadero: {}, tipoVehiculo: {} };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.findOne.onSecondCall().resolves({ ...tarifaMock, precioFraccionHora: 200 });
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      await service.actualizar(id, { precioFraccionHora: 200 } as any);

      // Assert
      expect(tarifaMock.precioFraccionHora).to.equal(200);
      expect(tarifaRepository.save.calledWith(tarifaMock)).to.be.true;
    });

    it('CS0004 - NO actualiza precioFraccionHora cuando NO viene definido', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id        = 1;
      const tarifaMock = { id, precioFraccionHora: 100, precioHoraAdicional: 50, parqueadero: {}, tipoVehiculo: {} };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.findOne.onSecondCall().resolves(tarifaMock);
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      await service.actualizar(id, {} as any);

      // Assert
      expect(tarifaMock.precioFraccionHora).to.equal(100);
    });

    it('CS0005 - actualiza precioHoraAdicional cuando viene definido', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id        = 1;
      const tarifaMock = { id, precioFraccionHora: 100, precioHoraAdicional: 50, parqueadero: {}, tipoVehiculo: {} };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.findOne.onSecondCall().resolves({ ...tarifaMock, precioHoraAdicional: 80 });
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      await service.actualizar(id, { precioHoraAdicional: 80 } as any);

      // Assert
      expect(tarifaMock.precioHoraAdicional).to.equal(80);
      expect(tarifaRepository.save.calledWith(tarifaMock)).to.be.true;
    });

    it('CS0006 - NO actualiza precioHoraAdicional cuando NO viene definido', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id        = 1;
      const tarifaMock = { id, precioFraccionHora: 100, precioHoraAdicional: 50, parqueadero: {}, tipoVehiculo: {} };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.findOne.onSecondCall().resolves(tarifaMock);
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      await service.actualizar(id, {} as any);

      // Assert
      expect(tarifaMock.precioHoraAdicional).to.equal(50);
    });

    it('CS0007 - retorna tarifa actualizada cuando se recupera correctamente', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const id              = 1;
      const tarifaMock          = { id, parqueadero: {}, tipoVehiculo: {} };
      const tarifaActualizadaMock = { ...tarifaMock };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.findOne.onSecondCall().resolves(tarifaActualizadaMock);
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      const result = await service.actualizar(id, {} as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.equal(tarifaActualizadaMock);
    });

    it('CS0008 - lanza NotFoundException cuando NO se puede recuperar la tarifa actualizada', async () => {
      // Arrange
      const { service, tarifaRepository } = await createTestingModule();

      const tarifaMock = { id: 1, parqueadero: {}, tipoVehiculo: {} };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.findOne.onSecondCall().resolves(null);
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      const action = service.actualizar(1, {} as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

});