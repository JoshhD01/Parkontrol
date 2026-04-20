import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from './empresas.controller.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

import { EmpresaResponseDto } from 'src/controller/empresas/dto/empresa-response.dto';

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('EmpresasController', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // obtenerTodas()
  // ==========================================================================
  describe('obtenerTodas', () => {

    it('EC-OT-001 - retorna lista de empresas cuando existen registros', async () => {
      // Arrange
      const { controller, empresaRepository } = await createTestingModule();

      empresaRepository.find.resolves([
        { id: 1, nombre: 'Empresa A' },
        { id: 2, nombre: 'Empresa B' },
      ]);

      // Act
      const result = await controller.obtenerTodas();

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(2);

      expect(result[0]).to.be.instanceOf(EmpresaResponseDto);
      expect(result[0]).to.have.property('id', 1);
      expect(result[0]).to.have.property('nombre', 'Empresa A');
    });

    it('EC-OT-002 - retorna lista vacía cuando no hay empresas', async () => {
      // Arrange
      const { controller, empresaRepository } = await createTestingModule();

      empresaRepository.find.resolves([]);

      // Act
      const result = await controller.obtenerTodas();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // obtenerDetalle()
  // ==========================================================================
  describe('obtenerDetalle', () => {

    it('EC-OD-001 - retorna detalle cuando empresa existe con id válido', async () => {
      // Arrange
      const { controller, empresaRepository } = await createTestingModule();

      empresaRepository.findOneBy.resolves({ id: 1, nombre: 'Empresa A' });

      // Act
      const result = await controller.obtenerDetalle(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.be.instanceOf(EmpresaResponseDto);

      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('nombre', 'Empresa A');
    });

    it('EC-OD-002 - lanza NotFoundException cuando empresa no existe', async () => {
      // Arrange
      const { controller, empresaRepository } = await createTestingModule();

      empresaRepository.findOneBy.resolves(null);

      // Act
      const action = controller.obtenerDetalle(999);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('EC-OD-003 - lanza NotFoundException cuando id no corresponde a ninguna empresa', async () => {
      // Arrange
      const { controller, empresaRepository } = await createTestingModule();

      empresaRepository.findOneBy.resolves(null);

      // Act
      const action = controller.obtenerDetalle(0);

      // Assert
      await expect(action).to.be.rejectedWith('Empresa con id: 0 no existe');
    });

    it('EC-OD-004 - retorna instancia de EmpresaResponseDto con propiedades correctas', async () => {
      // Arrange
      const { controller, empresaRepository } = await createTestingModule();

      empresaRepository.findOneBy.resolves({ id: 5, nombre: 'Empresa Test' });

      // Act
      const result = await controller.obtenerDetalle(5);

      // Assert
      expect(result).to.be.instanceOf(EmpresaResponseDto);
      expect(result).to.have.property('id',     5);
      expect(result).to.have.property('nombre', 'Empresa Test');
    });

  });

});