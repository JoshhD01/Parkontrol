import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createTestingModule } from './usuarios.controller.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('UsuariosController', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('UC-CR-001 - crea usuario correctamente', async () => {
      // Arrange
      const { controller, usuarioRepository, usuarioValidator, rolesService, empresasService } =
        await createTestingModule();

      const dto = {
        nombre: 'Test',
        correo: 'test@test.com',
        contrasena: '123456',
        idEmpresa: 1,
        rol: 'ADMIN',
      };

      usuarioValidator.validarUsuarioUnico.resolves();
      rolesService.findRoleByNombre.resolves({ id: 1 });
      empresasService.findEmpresaById.resolves({ id: 1 });

      usuarioRepository.create.returns({ id: 1 });
      usuarioRepository.save.resolves({ id: 1 });

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result).to.exist;
    });

    it('UC-CR-002 - lanza error si correo ya existe', async () => {
      // Arrange
      const { controller, usuarioValidator } =
        await createTestingModule();

      const dto = {
        correo: 'test@test.com',
      };

      usuarioValidator.validarUsuarioUnico.rejects(
        new Error('correo ya existe'),
      );

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('correo ya existe');
    });

  });

  // ==========================================================================
  // obtenerUsuariosEmpresa()
  // ==========================================================================
  describe('obtenerUsuariosEmpresa', () => {

    it('UC-OUE-001 - retorna usuarios de empresa', async () => {
      // Arrange
      const { controller, usuarioRepository } =
        await createTestingModule();

      const mock = [{ id: 1 }, { id: 2 }];
      usuarioRepository.find.resolves(mock);

      // Act
      const result = await controller.obtenerUsuariosEmpresa(1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(2);
    });

  });

  // ==========================================================================
  // obtenerPorId()
  // ==========================================================================
  describe('obtenerPorId', () => {

    it('UC-OPI-001 - retorna usuario cuando existe', async () => {
      // Arrange
      const { controller, usuarioRepository } =
        await createTestingModule();

      usuarioRepository.findOne.resolves({ id: 1 });

      // Act
      const result = await controller.obtenerPorId(1);

      // Assert
      expect(result).to.exist;
    });

    it('UC-OPI-002 - lanza NotFoundException cuando no existe', async () => {
      // Arrange
      const { controller, usuarioRepository } =
        await createTestingModule();

      usuarioRepository.findOne.resolves(null);

      // Act
      const action = controller.obtenerPorId(999);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

  // ==========================================================================
  // eliminar()
  // ==========================================================================
  describe('eliminar', () => {

    it('UC-EL-001 - elimina usuario correctamente', async () => {
      // Arrange
      const { controller, usuarioRepository, usuarioValidator } =
        await createTestingModule();

      const usuarioMock = { id: 1 };

      usuarioRepository.findOne.resolves(usuarioMock);
      usuarioValidator.validarEsOperador.resolves();
      usuarioRepository.remove.resolves();

      // Act
      const result = await controller.eliminar(1);

      // Assert
      expect(result).to.have.property(
        'mensaje',
        'Usuario Operador eliminado correctamente',
      );
    });

    it('UC-EL-002 - lanza NotFoundException si usuario no existe', async () => {
      // Arrange
      const { controller, usuarioRepository } =
        await createTestingModule();

      usuarioRepository.findOne.resolves(null);

      // Act
      const action = controller.eliminar(999);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

  // ==========================================================================
  // cambiarContrasena()
  // ==========================================================================
  describe('cambiarContrasena', () => {

    it('UC-CC-001 - cambia contraseña correctamente', async () => {
      // Arrange
      const { controller, usuarioRepository } =
        await createTestingModule();

      const user = { id: 1 };

      const usuarioMock = {
        id: 1,
        contrasena: '$2b$10$hash',
      };

      usuarioRepository.findOne.resolves(usuarioMock);
      usuarioRepository.save.resolves();

      // Stub bcrypt.compare
      sandbox.stub(require('bcrypt'), 'compare').resolves(true);
      sandbox.stub(require('bcrypt'), 'hash').resolves('newHash');

      // Act
      const result = await controller.cambiarContrasena(user as any, {
        contrasenaActual: '123',
        nuevaContrasena: '456',
      });

      // Assert
      expect(result).to.have.property(
        'mensaje',
        'Contraseña actualizada correctamente',
      );
    });

    it('UC-CC-002 - lanza NotFoundException si usuario no existe', async () => {
      // Arrange
      const { controller, usuarioRepository } =
        await createTestingModule();

      const user = { id: 1 };

      usuarioRepository.findOne.resolves(null);

      // Act
      const action = controller.cambiarContrasena(user as any, {
        contrasenaActual: '123',
        nuevaContrasena: '456',
      });

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

    it('UC-CC-003 - lanza BadRequestException si contraseña actual es incorrecta', async () => {
      // Arrange
      const { controller, usuarioRepository } =
        await createTestingModule();

      const user = { id: 1 };

      usuarioRepository.findOne.resolves({
        id: 1,
        contrasena: 'hash',
      });

      sandbox.stub(require('bcrypt'), 'compare').resolves(false);

      // Act
      const action = controller.cambiarContrasena(user as any, {
        contrasenaActual: 'wrong',
        nuevaContrasena: 'new',
      });

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException);
    });

  });

});