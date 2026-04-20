import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from './celdas.controller.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('CeldasController', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('CC-CR-001 - crea celda correctamente con dto válido', async () => {
      // Arrange
      const { controller, celdaRepository, tipoCeldaRepository, sensorRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda:   1,
        idSensor:      1,
        estado:        'LIBRE',
      };

      const celdaMock = { id: 10, estado: 'LIBRE' };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves({ id: 1 });
      sensorRepository.findOne.resolves({ id: 1 });
      celdaRepository.create.returns(celdaMock);
      celdaRepository.save.resolves(celdaMock);

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 10);
    });

    it('CC-CR-002 - lanza NotFoundException cuando tipoCelda no existe', async () => {
      // Arrange
      const { controller, tipoCeldaRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda:   99,
        idSensor:      1,
        estado:        'LIBRE',
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves(null);

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('CC-CR-003 - lanza NotFoundException cuando sensor no existe', async () => {
      // Arrange
      const { controller, tipoCeldaRepository, sensorRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda:   1,
        idSensor:      99,
        estado:        'LIBRE',
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves({ id: 1 });
      sensorRepository.findOne.resolves(null);

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('CC-CR-004 - dto con idParqueadero como string no es número válido', async () => {
      // Arrange
      const { controller, parqueaderosService } = await createTestingModule();

      const dto = {
        idParqueadero: 'abc' as any,
        idTipoCelda:   1,
        idSensor:      1,
        estado:        'LIBRE',
      };

      parqueaderosService.findParqueaderoById.rejects(new Error('idParqueadero inválido'));

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('idParqueadero inválido');
    });

    it('CC-CR-005 - dto con idTipoCelda como string no es número válido', async () => {
      // Arrange
      const { controller, tipoCeldaRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda:   'abc' as any,
        idSensor:      1,
        estado:        'LIBRE',
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves(null);

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('CC-CR-006 - dto con idSensor como string no es número válido', async () => {
      // Arrange
      const { controller, tipoCeldaRepository, sensorRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda:   1,
        idSensor:      'abc' as any,
        estado:        'LIBRE',
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves({ id: 1 });
      sensorRepository.findOne.resolves(null);

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('CC-CR-007 - dto con estado vacío', async () => {
      // Arrange
      const { controller, celdaRepository, tipoCeldaRepository, sensorRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda:   1,
        idSensor:      1,
        estado:        '',
      };

      const celdaMock = { id: 10, estado: '' };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves({ id: 1 });
      sensorRepository.findOne.resolves({ id: 1 });
      celdaRepository.create.returns(celdaMock);
      celdaRepository.save.resolves(celdaMock);

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result).to.have.property('estado', '');
    });

    it('CC-CR-008 - dto con estado como número no es string válido', async () => {
      // Arrange
      const { controller, celdaRepository, tipoCeldaRepository, sensorRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda:   1,
        idSensor:      1,
        estado:        123 as any,
      };

      const celdaMock = { id: 10, estado: 123 };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves({ id: 1 });
      sensorRepository.findOne.resolves({ id: 1 });
      celdaRepository.create.returns(celdaMock);
      celdaRepository.save.resolves(celdaMock);

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result).to.have.property('estado', 123);
    });

  });

  // ==========================================================================
  // obtenerPorParqueadero()
  // ==========================================================================
  describe('obtenerPorParqueadero', () => {

    it('CC-OPP-001 - retorna celdas cuando idParqueadero es válido', async () => {
      // Arrange
      const { controller, celdaRepository } = await createTestingModule();

      const celdasMock = [{ id: 1 }, { id: 2 }];
      celdaRepository.find.resolves(celdasMock);

      // Act
      const result = await controller.obtenerPorParqueadero(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(2);
    });

    it('CC-OPP-002 - retorna array vacío cuando no hay celdas para el parqueadero', async () => {
      // Arrange
      const { controller, celdaRepository } = await createTestingModule();

      celdaRepository.find.resolves([]);

      // Act
      const result = await controller.obtenerPorParqueadero(999);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // obtenerPorId()
  // ==========================================================================
  describe('obtenerPorId', () => {

    it('CC-OPI-001 - retorna celda cuando id es válido y existe', async () => {
      // Arrange
      const { controller, celdaRepository } = await createTestingModule();

      const celdaMock = { id: 1, estado: 'LIBRE' };
      celdaRepository.findOne.resolves(celdaMock);

      // Act
      const result = await controller.obtenerPorId(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

    it('CC-OPI-002 - lanza NotFoundException cuando celda no existe', async () => {
      // Arrange
      const { controller, celdaRepository } = await createTestingModule();

      celdaRepository.findOne.resolves(null);

      // Act
      const action = controller.obtenerPorId(999);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

  // ==========================================================================
  // actualizarEstado()
  // ==========================================================================
  describe('actualizarEstado', () => {

    it('CC-AE-001 - actualiza estado correctamente cuando celda existe', async () => {
      // Arrange
      const { controller, celdaRepository } = await createTestingModule();

      const celdaMock = { id: 1, estado: 'LIBRE', ultimoCambioEstado: null };
      const celdaActualizada = { ...celdaMock, estado: 'OCUPADA' };

      celdaRepository.findOne.resolves(celdaMock);
      celdaRepository.save.resolves(celdaActualizada);

      // Act
      const result = await controller.actualizarEstado(1, 'OCUPADA');

      // Assert
      expect(result).to.have.property('estado', 'OCUPADA');
    });

    it('CC-AE-002 - lanza NotFoundException cuando celda no existe', async () => {
      // Arrange
      const { controller, celdaRepository } = await createTestingModule();

      celdaRepository.findOne.resolves(null);

      // Act
      const action = controller.actualizarEstado(999, 'OCUPADA');

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('CC-AE-003 - actualiza estado con string vacío', async () => {
      // Arrange
      const { controller, celdaRepository } = await createTestingModule();

      const celdaMock     = { id: 1, estado: 'LIBRE', ultimoCambioEstado: null };
      const celdaActualizada = { ...celdaMock, estado: '' };

      celdaRepository.findOne.resolves(celdaMock);
      celdaRepository.save.resolves(celdaActualizada);

      // Act
      const result = await controller.actualizarEstado(1, '');

      // Assert
      expect(result).to.have.property('estado', '');
    });

    it('CC-AE-004 - actualiza ultimoCambioEstado al momento de la actualización', async () => {
      // Arrange
      const { controller, celdaRepository } = await createTestingModule();

      const celdaMock = { id: 1, estado: 'LIBRE', ultimoCambioEstado: null };

      celdaRepository.findOne.resolves(celdaMock);
      celdaRepository.save.resolves({ ...celdaMock, ultimoCambioEstado: new Date() });

      // Act
      const result = await controller.actualizarEstado(1, 'LIBRE');

      // Assert
      expect(result).to.have.property('ultimoCambioEstado').that.is.instanceOf(Date);
    });

  });

});