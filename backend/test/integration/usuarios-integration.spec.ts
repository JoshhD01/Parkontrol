import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/usuarios/usuarios.service.module';
import { RoleEnum } from 'src/entities/shared';

describe('UsuariosService Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('should create usuario successfully', async () => {
      const { service, usuarioRepository, usuarioValidator, rolesService, empresasService } = await createTestingModule();

      const dto = { nombre: 'Test User', correo: 'test@test.com', contrasena: 'password', idEmpresa: 1 };
      const rol = { id: 1, nombre: RoleEnum.OPERADOR };
      const empresa = { id: 1 };
      const usuario = { id: 1, ...dto, rol, empresa };

      usuarioValidator.validarUsuarioUnico.resolves();
      rolesService.findRoleByNombre.resolves(rol);
      empresasService.findEmpresaById.resolves(empresa);
      usuarioRepository.create.returns(usuario);
      usuarioRepository.save.resolves(usuario);

      const result = await service.crear(dto as any, RoleEnum.OPERADOR);

      expect(result.id).toBe(1);
    });
  });

  describe('findUsuarioByCorreo', () => {
    it('should return usuario by correo', async () => {
      const { service, usuarioRepository } = await createTestingModule();

      const usuario = { id: 1, correo: 'test@test.com' };
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(usuario),
      };
      usuarioRepository.createQueryBuilder.returns(queryBuilder);

      const result = await service.findUsuarioByCorreo('test@test.com');

      expect(result).toEqual(usuario);
    });
  });

  describe('findUsuarioById', () => {
    it('should return usuario if found', async () => {
      const { service, usuarioRepository } = await createTestingModule();

      const usuario = { id: 1 };
      usuarioRepository.findOne.resolves(usuario);

      const result = await service.findUsuarioById(1);

      expect(result).toEqual(usuario);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, usuarioRepository } = await createTestingModule();

      usuarioRepository.findOne.resolves(null);

      await expect(service.findUsuarioById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmpresa', () => {
    it('should return usuarios for empresa', async () => {
      const { service, usuarioRepository } = await createTestingModule();

      const usuarios = [{ id: 1 }];
      usuarioRepository.find.resolves(usuarios);

      const result = await service.findByEmpresa(1);

      expect(result.length).toBe(1);
    });
  });

  describe('eliminar', () => {
    it('should delete usuario', async () => {
      const { service, usuarioRepository, usuarioValidator } = await createTestingModule();

      const usuario = { id: 1 };
      service.findUsuarioById = jest.fn().mockResolvedValue(usuario);
      usuarioValidator.validarEsOperador.resolves();
      usuarioRepository.remove.resolves();

      await expect(service.eliminar(1)).resolves.toBeUndefined();
    });
  });

  describe('cambiarContrasena', () => {
    it('should change password', async () => {
      const { service, usuarioRepository } = await createTestingModule();

      const usuario = { id: 1, contrasena: 'hash' };
      usuarioRepository.findOne.resolves(usuario);
      usuarioRepository.save.resolves();

      const result = await service.cambiarContrasena(1, { contrasenaActual: 'old', nuevaContrasena: 'new' } as any);

      expect(result.mensaje).toBe('Contraseña actualizada correctamente');
    });

    it('should throw BadRequestException for wrong current password', async () => {
      const { service, usuarioRepository } = await createTestingModule();

      const usuario = { id: 1, contrasena: 'hash' };
      usuarioRepository.findOne.resolves(usuario);

      await expect(service.cambiarContrasena(1, { contrasenaActual: 'wrong', nuevaContrasena: 'new' } as any)).rejects.toThrow(BadRequestException);
    });
  });
});