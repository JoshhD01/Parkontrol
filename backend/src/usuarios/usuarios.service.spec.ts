jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { UsuarioValidator } from './validators/usuario.validator';
import { RolesService } from 'src/shared/services/roles/roles.service';
import { EmpresasService } from 'src/empresas/empresas.service';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsuariosService - Setup', () => {
  let service: UsuariosService;

  let usuarioRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    remove: jest.Mock;
  };
  let usuarioValidator: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    remove: jest.Mock;
  };
  let rolesService: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    remove: jest.Mock;
  };
  let empresasService: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    // 🔹 Mock del repository
    
    usuarioRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    // 🔹 Mock de servicios externos
    usuarioValidator = {
      validarUsuarioUnico: jest.fn(),
      validarEsOperador: jest.fn(),
    } as any;

    rolesService = {
      findRoleByNombre: jest.fn(),
    } as any;

    empresasService = {
      findEmpresaById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
        {
          provide: UsuarioValidator,
          useValue: usuarioValidator,
        },
        {
          provide: RolesService,
          useValue: rolesService,
        },
        {
          provide: EmpresasService,
          useValue: empresasService,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

describe('cambiarContrasena', () => {

  const id = 1;
  const dto = {
    contrasenaActual: '123456',
    nuevaContrasena: 'abcdef',
  };

  const usuarioMock = {
    id: 1,
    contrasena: 'hashedOldPassword',
  } as any;

  // 🔹 1. Si la DB retorna null → debe lanzar NotFoundException
  it('CS00001 - debe lanzar NotFoundException si el usuario no existe (null)', async () => {
    usuarioRepository.findOne!.mockResolvedValue(null);

    await expect(
      service.cambiarContrasena(id, dto),
    ).rejects.toThrow('No existe usuario con id: 1');

    expect(usuarioRepository.save).not.toHaveBeenCalled();
  });

  // 🔹 2. Si la DB retorna un objeto vacío → debe lanzar NotFoundException
  it('CS0002 - debe lanzar error si la DB retorna un objeto vacío', async () => {
    usuarioRepository.findOne!.mockResolvedValue({} as any);

    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

    await expect(
      service.cambiarContrasena(id, dto),
    ).rejects.toThrow();

    expect(usuarioRepository.save).not.toHaveBeenCalled();
  });

  // 🔹 3. Si la contraseña actual es inválida
  it('CS00003 - debe lanzar BadRequestException si la contraseña actual es incorrecta', async () => {
    usuarioRepository.findOne!.mockResolvedValue(usuarioMock);

    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

    await expect(
      service.cambiarContrasena(id, dto),
    ).rejects.toThrow('La contraseña actual es incorrecta');

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(usuarioRepository.save).not.toHaveBeenCalled();
  });

  // 🔹 4. Si falla el guardado en DB
  it('CS00004 - debe lanzar error si falla el guardado del usuario en DB', async () => {
    usuarioRepository.findOne!.mockResolvedValue(usuarioMock);

    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue('newHashedPassword');

    usuarioRepository.save!.mockRejectedValue(
      new Error('Error de conexión DB'),
    );

    await expect(
      service.cambiarContrasena(id, dto),
    ).rejects.toThrow('Error de conexión DB');
  });

});

});