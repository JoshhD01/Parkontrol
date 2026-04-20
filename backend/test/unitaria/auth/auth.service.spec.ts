import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';
import * as bcrypt from 'bcrypt';

chai.use(chaiAsPromised);

const expect = chai.expect as any;

import { AuthService } from '../../../src/service/auth/auth.service';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { ClienteAuth } from 'src/entities/auth/entities/cliente-auth.entity';
import { TipoAccesoLogin } from 'src/controller/auth/dto/login-usuario.dto';
import { RoleEnum } from 'src/entities/shared';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../../../src/service/usuarios/usuarios.service';


// ─── Helper ──────────────────────────────────────────────────────────────────
// FIRST → Isolated: genera stubs frescos por cada test, sin estado compartido
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('AuthService', () => {

  let service: AuthService;
  let usuariosService: Record<string, any>;
  let jwtService: Record<string, any>;
  let clienteFacturaRepository: Record<string, any>;
  let clienteAuthRepository: Record<string, any>;

  // Sandbox de sinon — restaura todos los stubs/spies al hacer restore()
  const sandbox = sinon.createSandbox();

  // ── Setup ─────────────────────────────────────────────────────────────────
  // FIRST → Fast + Isolated: módulo recompilado con stubs frescos en cada test
  beforeEach(async () => {
    usuariosService          = makeStub(['findUsuarioByCorreo']);
    clienteFacturaRepository = makeStub(['findOne', 'create', 'save']);
    clienteAuthRepository    = makeStub(['findOne', 'create', 'save']);

    // jwtService.sign es síncrono
    jwtService = { sign: sinon.stub().returns('token-jwt') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService,                             useValue: jwtService },
        { provide: UsuariosService,                        useValue: usuariosService },
        { provide: getRepositoryToken(ClienteFactura),     useValue: clienteFacturaRepository },
        { provide: getRepositoryToken(ClienteAuth),        useValue: clienteAuthRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── Teardown ──────────────────────────────────────────────────────────────
  // FIRST → Isolated: restaura sandbox para evitar contaminación entre tests
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // validarUsuario()
  // ==========================================================================
  describe('validarUsuario', () => {

    it('AS-VU-001 - retorna el usuario cuando las credenciales son válidas', async () => {
      // Arrange
      usuariosService.findUsuarioByCorreo.resolves({
        correo: 'test@test.com',
        contrasena: 'hash',
      });
      sandbox.stub(bcrypt, 'compare').resolves(true as never);

      // Act
      const result = await (service as any).validarUsuario('TEST@TEST.COM', '123');

      // Assert
      expect(result).to.exist;
    });

    it('AS-VU-002 - retorna null cuando el usuario no existe', async () => {
      // Arrange
      usuariosService.findUsuarioByCorreo.resolves(null);

      // Act
      const result = await (service as any).validarUsuario('test@test.com', '123');

      // Assert
      expect(result).to.be.null;
    });

  });

  // ==========================================================================
  // validarCliente()
  // ==========================================================================
  describe('validarCliente', () => {

    it('AS-VC-001 - retorna el cliente cuando las credenciales son válidas', async () => {
      // Arrange
      clienteAuthRepository.findOne.resolves({
        correo:         'test@test.com',
        activo:         true,
        contrasenaHash: 'hash',
        clienteFactura: { id: 1 },
      });
      sandbox.stub(bcrypt, 'compare').resolves(true as never);

      // Act
      const result = await (service as any).validarCliente('TEST@TEST.COM', '123');

      // Assert
      expect(result).to.exist;
    });

    it('AS-VC-002 - retorna null cuando el cliente no existe', async () => {
      // Arrange
      clienteAuthRepository.findOne.resolves(null);

      // Act
      const result = await (service as any).validarCliente('test@test.com', '123');

      // Assert
      expect(result).to.be.null;
    });

  });

  // ==========================================================================
  // login() — CLIENTE
  // ==========================================================================
  describe('login - CLIENTE', () => {

    const dtoCliente = {
      correo:      'test@test.com',
      contrasena:  '123',
      tipoAcceso:  TipoAccesoLogin.CLIENTE,
    };

    it('AS-LC-001 - retorna access_token cuando el login de cliente es exitoso', async () => {
      // Arrange
      sandbox.stub(service as any, 'validarCliente').resolves({
        correo:         'test@test.com',
        clienteFactura: { id: 1 },
      });

      // Act
      const result = await service.login(dtoCliente as any);

      // Assert
      expect(result).to.have.property('access_token');
    });

    it('AS-LC-002 - lanza UnauthorizedException cuando las credenciales de cliente son inválidas', async () => {
      // Arrange
      sandbox.stub(service as any, 'validarCliente').resolves(null);

      // Act
      const action = service.login(dtoCliente as any);

      // Assert
      await expect(action).to.be.rejectedWith(UnauthorizedException);
    });

  });

  // ==========================================================================
  // login() — USUARIO
  // ==========================================================================
  describe('login - USUARIO', () => {

    const dtoAdmin    = { correo: 'test@test.com', contrasena: '123', tipoAcceso: TipoAccesoLogin.ADMIN };
    const dtoOperador = { correo: 'test@test.com', contrasena: '123', tipoAcceso: TipoAccesoLogin.OPERADOR };

    it('AS-LU-001 - retorna access_token cuando el login de usuario admin es exitoso', async () => {
      // Arrange
      sandbox.stub(service as any, 'validarUsuario').resolves({
        id:      1,
        correo:  'test@test.com',
        rol:     { nombre: RoleEnum.ADMIN },
        empresa: { id: 1 },
      });

      // Act
      const result = await service.login(dtoAdmin as any);

      // Assert
      expect(result).to.have.property('access_token');
    });

    it('AS-LU-002 - lanza UnauthorizedException cuando las credenciales de usuario son inválidas', async () => {
      // Arrange
      sandbox.stub(service as any, 'validarUsuario').resolves(null);

      // Act
      const action = service.login(dtoAdmin as any);

      // Assert
      await expect(action).to.be.rejectedWith(UnauthorizedException);
    });

    it('AS-LU-003 - lanza UnauthorizedException cuando el rol no es ADMIN para acceso ADMIN', async () => {
      // Arrange
      sandbox.stub(service as any, 'validarUsuario').resolves({
        id:      1,
        correo:  'test@test.com',
        rol:     { nombre: RoleEnum.OPERADOR },
        empresa: { id: 1 },
      });

      // Act
      const action = service.login(dtoAdmin as any);

      // Assert
      await expect(action).to.be.rejectedWith(UnauthorizedException);
    });

    it('AS-LU-004 - lanza UnauthorizedException cuando el rol no es OPERADOR para acceso OPERADOR', async () => {
      // Arrange
      sandbox.stub(service as any, 'validarUsuario').resolves({
        id:      1,
        correo:  'test@test.com',
        rol:     { nombre: RoleEnum.ADMIN },
        empresa: { id: 1 },
      });

      // Act
      const action = service.login(dtoOperador as any);

      // Assert
      await expect(action).to.be.rejectedWith(UnauthorizedException);
    });

  });

  // ==========================================================================
  // registrarCliente()
  // ==========================================================================
  describe('registrarCliente', () => {

    // DTO base reutilizable — FIRST → Repeatable
    const dtoBase = {
      correo:          'test@test.com',
      tipoDocumento:   'CC',
      numeroDocumento: '123',
      contrasena:      '123',
    };

    it('AS-RC-001 - crea y retorna el cliente cuando los datos son válidos', async () => {
      // Arrange
      clienteFacturaRepository.findOne.resolves(null);
      clienteAuthRepository.findOne.resolves(null);

      clienteFacturaRepository.create.returns({ id: 1, correo: 'test@test.com' });
      clienteFacturaRepository.save.resolves({ id: 1, correo: 'test@test.com' });

      clienteAuthRepository.create.returns({});
      clienteAuthRepository.save.resolves({});

      sandbox.stub(bcrypt, 'hash').resolves('hash' as never);

      // Act
      const result = await service.registrarCliente(dtoBase as any);

      // Assert
      expect(result).to.have.property('correo');
    });

    it('AS-RC-002 - lanza BadRequestException cuando el documento está asociado a otro correo', async () => {
      // Arrange
      clienteFacturaRepository.findOne.resolves({ correo: 'otro@test.com' });

      // Act
      const action = service.registrarCliente(dtoBase as any);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException);
    });

    it('AS-RC-003 - lanza BadRequestException cuando el cliente ya está registrado', async () => {
      // Arrange
      clienteFacturaRepository.findOne.resolves({ id: 1, correo: 'test@test.com' });
      clienteAuthRepository.findOne.resolves({ id: 1 });

      // Act
      const action = service.registrarCliente(dtoBase as any);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException);
    });

  });

});