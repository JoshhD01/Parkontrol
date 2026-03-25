import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsuariosService } from './usuarios.service';
import { Usuario } from 'src/entities/usuarios/entities/usuario.entity';
import { UsuarioValidator } from 'src/controller/usuarios/validators/usuario.validator';
import { RolesService } from 'src/entities/shared/services/roles/roles.service';
import { EmpresasService } from 'src/service/empresas/empresas.service';
import { RoleEnum } from 'src/entities/shared';
import * as bcrypt from 'bcrypt';

describe('UsuariosService', () => {
  let service: UsuariosService;

  let usuarioRepository: any;
  let usuarioValidator: any;
  let rolesService: any;
  let empresasService: any;

  beforeEach(async () => {
    usuarioRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    usuarioValidator = {
      validarUsuarioUnico: jest.fn(),
      validarEsOperador: jest.fn(),
    };

    rolesService = {
      findRoleByNombre: jest.fn(),
    };

    empresasService = {
      findEmpresaById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepository },
        { provide: UsuarioValidator, useValue: usuarioValidator },
        { provide: RolesService, useValue: rolesService },
        { provide: EmpresasService, useValue: empresasService },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const usuarioMock = { id: 1, correo: 'test@test.com', contrasena: 'hash' };

  // ============================
  // CREAR
  // ============================
  describe('crear', () => {

    it('CS0001 - crea usuario correctamente', async () => {

      // Arrange
      const dto = {
        nombre: 'Test',
        correo: 'test@test.com',
        contrasena: '123',
        idEmpresa: 1,
      };

      usuarioValidator.validarUsuarioUnico.mockResolvedValue(undefined);
      rolesService.findRoleByNombre.mockResolvedValue({ id: 1 });
      empresasService.findEmpresaById.mockResolvedValue({ id: 1 });

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      usuarioRepository.create.mockReturnValue(usuarioMock);
      usuarioRepository.save.mockResolvedValue(usuarioMock);

      // Act
      const result = await service.crear(dto as any, RoleEnum.ADMIN);

      // Assert
      expect(result).toBeDefined();
      expect(usuarioRepository.save).toHaveBeenCalled();
    });

  });

  // ============================
  // findUsuarioByCorreo
  // ============================
  describe('findUsuarioByCorreo', () => {

    it('CS0001 - usuario existe', async () => {

      // Arrange
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(usuarioMock),
      };

      usuarioRepository.createQueryBuilder.mockReturnValue(qb);

      // Act
      const result = await service.findUsuarioByCorreo('TEST@TEST.COM');

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
    });

    it('CS0002 - usuario no existe', async () => {

      // Arrange
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      usuarioRepository.createQueryBuilder.mockReturnValue(qb);

      // Act
      const result = await service.findUsuarioByCorreo('none@test.com');

      // Assert
      expect(result).toBeNull();
    });

  });

  // ============================
  // findUsuarioById
  // ============================
  describe('findUsuarioById', () => {

    it('CS0001 - usuario no existe', async () => {

      // Arrange
      usuarioRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.findUsuarioById(1);

      // Assert
      await expect(action).rejects.toThrow(
        'No existe usuario con id: 1',
      );
    });

    it('CS0002 - usuario existe', async () => {

      // Arrange
      usuarioRepository.findOne.mockResolvedValue(usuarioMock);

      // Act
      const result = await service.findUsuarioById(1);

      // Assert
      expect(result).toBeDefined();
    });

  });

  // ============================
  // findByEmpresa
  // ============================
  describe('findByEmpresa', () => {

    it('CS0001 - retorna usuarios', async () => {

      // Arrange
      usuarioRepository.find.mockResolvedValue([usuarioMock]);

      // Act
      const result = await service.findByEmpresa(1);

      // Assert
      expect(result).toHaveLength(1);
    });

    it('CS0002 - retorna vacío', async () => {

      // Arrange
      usuarioRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByEmpresa(1);

      // Assert
      expect(result).toHaveLength(0);
    });

  });

  // ============================
  // eliminar
  // ============================
  describe('eliminar', () => {

    it('CS0001 - elimina correctamente', async () => {

      // Arrange
      jest.spyOn(service, 'findUsuarioById').mockResolvedValue(usuarioMock as any);

      usuarioValidator.validarEsOperador.mockReturnValue(undefined);

      // Act
      await service.eliminar(1);

      // Assert
      expect(usuarioRepository.remove).toHaveBeenCalled();
    });

    it('CS0002 - no pasa validación de operador', async () => {

      // Arrange
      jest.spyOn(service, 'findUsuarioById').mockResolvedValue(usuarioMock as any);

      usuarioValidator.validarEsOperador.mockImplementation(() => {
        throw new Error('No permitido');
      });

      // Act
      const action = service.eliminar(1);

      // Assert
      await expect(action).rejects.toThrow();
    });

  });

  // ============================
  // cambiarContrasena
  // ============================
  describe('cambiarContrasena', () => {

    it('CS0001 - usuario no existe', async () => {

      // Arrange
      usuarioRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.cambiarContrasena(1, {
        contrasenaActual: '123',
        nuevaContrasena: '456',
      } as any);

      // Assert
      await expect(action).rejects.toThrow(
        'No existe usuario con id: 1',
      );
    });

    it('CS0002 - usuario existe', async () => {

      // Arrange
      usuarioRepository.findOne.mockResolvedValue(usuarioMock);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHash' as never);

      usuarioRepository.save.mockResolvedValue({
        ...usuarioMock,
        contrasena: 'newHash',
      });

      // Act
      const result = await service.cambiarContrasena(1, {
        contrasenaActual: '123',
        nuevaContrasena: '456',
      } as any);

      // Assert
      expect(result.mensaje).toBe('Contraseña actualizada correctamente');
    });

    it('CS0003 - contraseña incorrecta', async () => {

      // Arrange
      usuarioRepository.findOne.mockResolvedValue(usuarioMock);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act
      const action = service.cambiarContrasena(1, {
        contrasenaActual: 'wrong',
        nuevaContrasena: '456',
      } as any);

      // Assert
      await expect(action).rejects.toThrow(
        'La contraseña actual es incorrecta',
      );
    });

    it('CS0004 - contraseña correcta', async () => {

      // Arrange
      usuarioRepository.findOne.mockResolvedValue(usuarioMock);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHash' as never);

      usuarioRepository.save.mockResolvedValue(usuarioMock);

      // Act
      const result = await service.cambiarContrasena(1, {
        contrasenaActual: '123',
        nuevaContrasena: '456',
      } as any);

      // Assert
      expect(usuarioRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

  });

});