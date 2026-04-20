import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from './reportes.controller.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('ReportesController', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('RC-CR-001 - crea reporte correctamente con dto válido', async () => {
      // Arrange
      const { controller, reporteRepository, periodoRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idPeriodo: 1,
        urlArchivo: 'http://file.com',
      };

      const reporteMock = { id: 10, urlArchivo: dto.urlArchivo };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      periodoRepository.findOne.resolves({ id: 1 });
      reporteRepository.create.returns(reporteMock);
      reporteRepository.save.resolves(reporteMock);

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 10);
    });

    it('RC-CR-002 - lanza NotFoundException cuando periodo no existe', async () => {
      // Arrange
      const { controller, periodoRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idPeriodo: 99,
        urlArchivo: 'http://file.com',
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      periodoRepository.findOne.resolves(null);

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('RC-CR-003 - dto con idParqueadero inválido', async () => {
      // Arrange
      const { controller, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 'abc' as any,
        idPeriodo: 1,
      };

      parqueaderosService.findParqueaderoById.rejects(
        new Error('idParqueadero inválido'),
      );

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('idParqueadero inválido');
    });

    it('RC-CR-004 - dto con idPeriodo inválido', async () => {
      // Arrange
      const { controller, periodoRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idPeriodo: 'abc' as any,
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      periodoRepository.findOne.resolves(null);

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('RC-CR-005 - crea reporte sin urlArchivo (opcional)', async () => {
      // Arrange
      const { controller, reporteRepository, periodoRepository, parqueaderosService } =
        await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idPeriodo: 1,
      };

      const reporteMock = { id: 10, urlArchivo: undefined };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      periodoRepository.findOne.resolves({ id: 1 });
      reporteRepository.create.returns(reporteMock);
      reporteRepository.save.resolves(reporteMock);

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result).to.have.property('urlArchivo', undefined);
    });

  });

  // ==========================================================================
  // obtenerPorParqueadero()
  // ==========================================================================
  describe('obtenerPorParqueadero', () => {

    it('RC-OPP-001 - retorna reportes cuando idParqueadero es válido', async () => {
      // Arrange
      const { controller, reporteRepository } = await createTestingModule();

      const mock = [{ id: 1 }, { id: 2 }];
      reporteRepository.find.resolves(mock);

      // Act
      const result = await controller.obtenerPorParqueadero(1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(2);
    });

    it('RC-OPP-002 - retorna array vacío cuando no hay reportes', async () => {
      // Arrange
      const { controller, reporteRepository } = await createTestingModule();

      reporteRepository.find.resolves([]);

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

    it('RC-OPI-001 - retorna reporte cuando existe', async () => {
      // Arrange
      const { controller, reporteRepository } = await createTestingModule();

      const mock = { id: 1 };
      reporteRepository.findOne.resolves(mock);

      // Act
      const result = await controller.obtenerPorId(1);

      // Assert
      expect(result).to.have.property('id', 1);
    });

    it('RC-OPI-002 - lanza NotFoundException cuando no existe', async () => {
      // Arrange
      const { controller, reporteRepository } = await createTestingModule();

      reporteRepository.findOne.resolves(null);

      // Act
      const action = controller.obtenerPorId(999);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

  // ==========================================================================
  // actualizarUrl()
  // ==========================================================================
  describe('actualizarUrl', () => {

    it('RC-AU-001 - actualiza url correctamente', async () => {
      // Arrange
      const { controller, reporteRepository } = await createTestingModule();

      const reporteMock = { id: 1, urlArchivo: null };
      const actualizado = { ...reporteMock, urlArchivo: 'http://new.com' };

      reporteRepository.findOne.resolves(reporteMock);
      reporteRepository.save.resolves(actualizado);

      // Act
      const result = await controller.actualizarUrl(1, 'http://new.com');

      // Assert
      expect(result).to.have.property('urlArchivo', 'http://new.com');
    });

    it('RC-AU-002 - lanza NotFoundException cuando reporte no existe', async () => {
      // Arrange
      const { controller, reporteRepository } = await createTestingModule();

      reporteRepository.findOne.resolves(null);

      // Act
      const action = controller.actualizarUrl(999, 'http://new.com');

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('RC-AU-003 - actualiza url con string vacío', async () => {
      // Arrange
      const { controller, reporteRepository } = await createTestingModule();

      const reporteMock = { id: 1, urlArchivo: 'old' };
      const actualizado = { ...reporteMock, urlArchivo: '' };

      reporteRepository.findOne.resolves(reporteMock);
      reporteRepository.save.resolves(actualizado);

      // Act
      const result = await controller.actualizarUrl(1, '');

      // Assert
      expect(result).to.have.property('urlArchivo', '');
    });

  });

});