import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';
import * as bcrypt from 'bcrypt';

chai.use(chaiAsPromised);

const expect = chai.expect as any;

import { UsuariosService } from 'src/service/usuarios/usuarios.service';
import { Usuario } from 'src/entities/usuarios/entities/usuario.entity';
import { UsuarioValidator } from 'src/controller/usuarios/validators/usuario.validator';
import { RolesService } from 'src/entities/shared/services/roles/roles.service';
import { EmpresasService } from 'src/service/empresas/empresas.service';
import { RoleEnum } from 'src/entities/shared';


// ─── Helper ──────────────────────────────────────────────────────────────────
// FIRST → Isolated: genera stubs frescos por cada test, sin estado compartido
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// Helper para QueryBuilder encadenado
function makeQueryBuilder(result: any): Record<string, any> {
  const qb: Record<string, any> = {};
  ['leftJoinAndSelect', 'where'].forEach((m) => {
    qb[m] = sinon.stub().returns(qb);
  });
  qb.getOne = sinon.stub().resolves(result);
  return qb;
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('UsuariosService', () => {

  let service: UsuariosService;
  let usuarioRepository: Record<string, any>;
  let usuarioValidator: Record<string, any>;
  let rolesService: Record<string, any>;
  let empresasService: Record<string, any>;

  // Sandbox de sinon — restaura todos los stubs/spies al hacer restore()
  const sandbox = sinon.createSandbox();

  // ── Fixtures ─────────────────────────────────────────────────────────────
  const usuarioMock = { id: 1, correo: 'test@test.com', contrasena: 'hash' };

  // ── Setup ─────────────────────────────────────────────────────────────────
  // FIRST → Fast + Isolated: módulo recompilado con stubs frescos en cada test
  beforeEach(async () => {
    usuarioRepository = makeStub(['create', 'save', 'findOne', 'find', 'remove', 'createQueryBuilder']);
    usuarioValidator  = makeStub(['validarUsuarioUnico', 'validarEsOperador']);
    rolesService      = makeStub(['findRoleByNombre']);
    empresasService   = makeStub(['findEmpresaById']);

    // validarEsOperador es síncrono — sobreescribir con stub síncrono
    usuarioValidator.validarEsOperador = sinon.stub().returns(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepository },
        { provide: UsuarioValidator,            useValue: usuarioValidator },
        { provide: RolesService,                useValue: rolesService },
        { provide: EmpresasService,             useValue: empresasService },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  // ── Teardown ──────────────────────────────────────────────────────────────
  // FIRST → Isolated: restaura sandbox para evitar contaminación entre tests
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('US-CREAR-001 - crea y retorna el usuario correctamente', async () => {
      // Arrange
      const dto = {
        nombre:     'Test',
        correo:     'test@test.com',
        contrasena: '123',
        idEmpresa:  1,
      };

      usuarioValidator.validarUsuarioUnico.resolves(undefined);
      rolesService.findRoleByNombre.resolves({ id: 1 });
      empresasService.findEmpresaById.resolves({ id: 1 });

      sandbox.stub(bcrypt, 'hash').resolves('hashed');

      usuarioRepository.create.returns(usuarioMock);
      usuarioRepository.save.resolves(usuarioMock);

      // Act
      const result = await service.crear(dto as any, RoleEnum.ADMIN);

      // Assert
      expect(result)
        .to.exist
        .and.to.be.an('object');

      expect(usuarioRepository.save.calledOnce).to.be.true;
    });

  });

  // ==========================================================================
  // findUsuarioByCorreo()
  // ==========================================================================
  describe('findUsuarioByCorreo', () => {

    it('US-FUBC-001 - retorna el usuario cuando el correo existe', async () => {
      // Arrange
      usuarioRepository.createQueryBuilder.returns(
        makeQueryBuilder(usuarioMock),
      );

      // Act
      const result = await service.findUsuarioByCorreo('TEST@TEST.COM');

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

    it('US-FUBC-002 - retorna null cuando el correo no existe', async () => {
      // Arrange
      usuarioRepository.createQueryBuilder.returns(
        makeQueryBuilder(null),
      );

      // Act
      const result = await service.findUsuarioByCorreo('none@test.com');

      // Assert
      expect(result).to.be.null;
    });

  });

  // ==========================================================================
  // findUsuarioById()
  // ==========================================================================
  describe('findUsuarioById', () => {

    it('US-FUBI-001 - lanza excepción cuando el usuario no existe', async () => {
      // Arrange
      usuarioRepository.findOne.resolves(null);

      // Act
      const action = service.findUsuarioById(1);

      // Assert
      await expect(action).to.be.rejectedWith('No existe usuario con id: 1');
    });

    it('US-FUBI-002 - retorna el usuario cuando existe', async () => {
      // Arrange
      usuarioRepository.findOne.resolves(usuarioMock);

      // Act
      const result = await service.findUsuarioById(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

  });

  // ==========================================================================
  // findByEmpresa()
  // ==========================================================================
  describe('findByEmpresa', () => {

    it('US-FBE-001 - retorna lista de usuarios de la empresa', async () => {
      // Arrange
      usuarioRepository.find.resolves([usuarioMock]);

      // Act
      const result = await service.findByEmpresa(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);
    });

    it('US-FBE-002 - retorna lista vacía cuando no hay usuarios', async () => {
      // Arrange
      usuarioRepository.find.resolves([]);

      // Act
      const result = await service.findByEmpresa(1);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // eliminar()
  // ==========================================================================
  describe('eliminar', () => {

    it('US-ELIM-001 - elimina el usuario correctamente', async () => {
      // Arrange
      sandbox.stub(service, 'findUsuarioById').resolves(usuarioMock as any);
      usuarioValidator.validarEsOperador.returns(undefined);

      // Act
      await service.eliminar(1);

      // Assert
      expect(usuarioRepository.remove.calledOnce).to.be.true;
    });

    it('US-ELIM-002 - lanza excepción cuando la validación falla', async () => {
      // Arrange
      sandbox.stub(service, 'findUsuarioById').resolves(usuarioMock as any);
      usuarioValidator.validarEsOperador.throws(new Error('No permitido'));

      // Act
      const action = service.eliminar(1);

      // Assert
      await expect(action).to.be.rejectedWith('No permitido');
    });

  });

  // ==========================================================================
  // cambiarContrasena()
  // ==========================================================================
  describe('cambiarContrasena', () => {

    const dtoBase = {
      contrasenaActual: '123',
      nuevaContrasena:  '456',
    };

    it('US-CC-001 - lanza excepción cuando el usuario no existe', async () => {
      // Arrange
      usuarioRepository.findOne.resolves(null);

      // Act
      const action = service.cambiarContrasena(1, dtoBase as any);

      // Assert
      await expect(action).to.be.rejectedWith('No existe usuario con id: 1');
    });

    it('US-CC-002 - lanza excepción cuando la contraseña actual es incorrecta', async () => {
      // Arrange
      usuarioRepository.findOne.resolves(usuarioMock);
      sandbox.stub(bcrypt, 'compare').resolves(false as never);

      // Act
      const action = service.cambiarContrasena(1, {
        ...dtoBase,
        contrasenaActual: 'wrong',
      } as any);

      // Assert
      await expect(action).to.be.rejectedWith('La contraseña actual es incorrecta');
    });

    it('US-CC-003 - actualiza y confirma el cambio de contraseña', async () => {
      // Arrange
      usuarioRepository.findOne.resolves(usuarioMock);
      sandbox.stub(bcrypt, 'compare').resolves(true as never);
      sandbox.stub(bcrypt, 'hash').resolves('newHash' as never);
      usuarioRepository.save.resolves({ ...usuarioMock, contrasena: 'newHash' });

      // Act
      const result = await service.cambiarContrasena(1, dtoBase as any);

      // Assert
      expect(usuarioRepository.save.calledOnce).to.be.true;
      expect(result)
        .to.exist
        .and.to.have.property('mensaje');
    });

  });

});