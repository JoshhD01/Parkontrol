import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createTestingModule } from './tarifas.controller.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('TarifasController', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('TC-CR-001 - crea tarifa correctamente con dto válido', async () => {
      // Arrange
      const { controller, tarifaRepository, tipoVehiculoRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoVehiculo: 1,
        precioFraccionHora: 1000,
        precioHoraAdicional: 500,
      };

      const tarifaMock = { id: 10 };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves({ id: 1 });
      tarifaRepository.create.returns(tarifaMock);
      tarifaRepository.save.resolves(tarifaMock);

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result).to.have.property('id', 10);
    });

    it('TC-CR-002 - lanza NotFoundException cuando tipoVehiculo no existe', async () => {
      // Arrange
      const { controller, tipoVehiculoRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoVehiculo: 99,
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves(null);

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('TC-CR-003 - dto con idParqueadero inválido', async () => {
      // Arrange
      const { controller, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 'abc' as any,
        idTipoVehiculo: 1,
      };

      parqueaderosService.findParqueaderoById.rejects(
        new Error('idParqueadero inválido'),
      );

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('idParqueadero inválido');
    });

  });

  // ==========================================================================
  // obtenerPorParqueadero()
  // ==========================================================================
  describe('obtenerPorParqueadero', () => {

    it('TC-OPP-001 - retorna tarifas cuando id es válido', async () => {
      // Arrange
      const { controller, tarifaRepository, parqueaderosService } =
        await createTestingModule();

      const mock = [{ id: 1 }, { id: 2 }];

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tarifaRepository.find.resolves(mock);

      // Act
      const result = await controller.obtenerPorParqueadero(1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(2);
    });

    it('TC-OPP-002 - lanza BadRequestException cuando id es inválido', async () => {
      // Arrange
      const { controller } = await createTestingModule();

      // Act
      const action = controller.obtenerPorParqueadero(0);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException);
    });

    it('TC-OPP-003 - lanza NotFoundException cuando parqueadero no existe', async () => {
      // Arrange
      const { controller, parqueaderosService } =
        await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves(null);

      // Act
      const action = controller.obtenerPorParqueadero(1);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

  // ==========================================================================
  // actualizar()
  // ==========================================================================
  describe('actualizar', () => {

    it('TC-AC-001 - actualiza tarifa correctamente', async () => {
      // Arrange
      const { controller, tarifaRepository } = await createTestingModule();

      const tarifaMock = {
        id: 1,
        precioFraccionHora: 1000,
        precioHoraAdicional: 500,
      };

      const actualizada = {
        ...tarifaMock,
        precioFraccionHora: 2000,
      };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.save.resolves();
      tarifaRepository.findOne.onSecondCall().resolves(actualizada);

      // Act
      const result = await controller.actualizar(1, {
        precioFraccionHora: 2000,
      } as any);

      // Assert
      expect(result).to.have.property('precioFraccionHora', 2000);
    });

    it('TC-AC-002 - lanza NotFoundException cuando tarifa no existe', async () => {
      // Arrange
      const { controller, tarifaRepository } = await createTestingModule();

      tarifaRepository.findOne.resolves(null);

      // Act
      const action = controller.actualizar(999, {});

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('TC-AC-003 - actualiza solo precioHoraAdicional', async () => {
      // Arrange
      const { controller, tarifaRepository } = await createTestingModule();

      const tarifaMock = {
        id: 1,
        precioFraccionHora: 1000,
        precioHoraAdicional: 500,
      };

      const actualizada = {
        ...tarifaMock,
        precioHoraAdicional: 800,
      };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.save.resolves();
      tarifaRepository.findOne.onSecondCall().resolves(actualizada);

      // Act
      const result = await controller.actualizar(1, {
        precioHoraAdicional: 800,
      } as any);

      // Assert
      expect(result).to.have.property('precioHoraAdicional', 800);
    });

    it('TC-AC-004 - lanza NotFoundException si no se puede recuperar la tarifa actualizada', async () => {
      // Arrange
      const { controller, tarifaRepository } = await createTestingModule();

      const tarifaMock = { id: 1 };

      tarifaRepository.findOne.onFirstCall().resolves(tarifaMock);
      tarifaRepository.save.resolves();
      tarifaRepository.findOne.onSecondCall().resolves(null);

      // Act
      const action = controller.actualizar(1, {});

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

});