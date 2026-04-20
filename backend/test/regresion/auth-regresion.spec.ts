import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/auth/auth.service.module';
import { TipoAccesoLogin } from 'src/controller/auth/dto/login-usuario.dto';
import { RoleEnum } from 'src/entities/shared';
import * as bcrypt from 'bcrypt';

describe('AuthService Regression Tests', () => {
  let moduleRefs: any[] = [];

  afterEach(() => {
    jest.clearAllMocks();
    moduleRefs.forEach(ref => ref?.close?.());
    moduleRefs = [];
  });

  describe('registrarCliente - Regression', () => {
    it('should register new client with valid data', async () => {
      const { service, clienteFacturaRepository, clienteAuthRepository } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123456789',
        correo: 'test@test.com',
        contrasena: 'password123',
      };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns({ tipoDocumento: 'cc', numeroDocumento: '123456789', correo: 'test@test.com' });
      clienteFacturaRepository.save.resolves({ id: 1, tipoDocumento: 'cc', numeroDocumento: '123456789', correo: 'test@test.com' });
      clienteAuthRepository.findOne.resolves(null);
      clienteAuthRepository.create.returns({ clienteFactura: { id: 1 }, correo: 'test@test.com', contrasenaHash: 'hash', activo: true });
      clienteAuthRepository.save.resolves();

      const result = await service.registrarCliente(dto as any);

      expect(result).toEqual({ idClienteFactura: 1, correo: 'test@test.com' });
    });

    it('should reuse existing clienteFactura if document matches', async () => {
      const { service, clienteFacturaRepository, clienteAuthRepository } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123456789',
        correo: 'test@test.com',
        contrasena: 'password123',
      };

      const existingFactura = { id: 1, tipoDocumento: 'cc', numeroDocumento: '123456789', correo: 'test@test.com' };
      clienteFacturaRepository.findOne.resolves(existingFactura);
      clienteAuthRepository.findOne.resolves(null);
      clienteAuthRepository.create.returns({ clienteFactura: existingFactura, correo: 'test@test.com', contrasenaHash: 'hash', activo: true });
      clienteAuthRepository.save.resolves();

      const result = await service.registrarCliente(dto as any);

      expect(result.idClienteFactura).toBe(1);
      expect(clienteFacturaRepository.create.called).toBe(false);
    });

    it('should throw BadRequestException if document associated with different email', async () => {
      const { service, clienteFacturaRepository } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123456789',
        correo: 'new@test.com',
        contrasena: 'password123',
      };

      clienteFacturaRepository.findOne.resolves({ correo: 'old@test.com' });

      await expect(service.registrarCliente(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if client auth already exists', async () => {
      const { service, clienteFacturaRepository, clienteAuthRepository } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123456789',
        correo: 'test@test.com',
        contrasena: 'password123',
      };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns({ id: 1 });
      clienteFacturaRepository.save.resolves({ id: 1 });
      clienteAuthRepository.findOne.resolves({ id: 1 });

      await expect(service.registrarCliente(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login - Regression', () => {
    it('should login client successfully with valid credentials', async () => {
      const { service, clienteAuthRepository } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoAcceso: TipoAccesoLogin.CLIENTE,
        correo: 'test@test.com',
        contrasena: 'password123',
      };

      const clienteAuth = {
        clienteFactura: { id: 1 },
        correo: 'test@test.com',
        contrasenaHash: 'hash',
        activo: true,
      };

      clienteAuthRepository.findOne.resolves(clienteAuth);
      // Mock bcrypt.compare
      const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(true);
      moduleRefs.push({ close: () => bcryptStub.restore() });

      const result = await service.login(dto as any);

      expect(result).toEqual({ access_token: 'token-jwt' });
      bcryptStub.restore();
    });

    it('should login admin successfully', async () => {
      const { service, usuariosService } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoAcceso: TipoAccesoLogin.ADMIN,
        correo: 'admin@test.com',
        contrasena: 'password123',
      };

      const usuario = {
        id: 1,
        correo: 'admin@test.com',
        contrasena: 'hash',
        rol: { nombre: RoleEnum.ADMIN },
        empresa: { id: 1 },
      };

      usuariosService.findUsuarioByCorreo.resolves(usuario);
      const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(true);
      moduleRefs.push({ close: () => bcryptStub.restore() });

      const result = await service.login(dto as any);

      expect(result).toEqual({ access_token: 'token-jwt' });
      bcryptStub.restore();
    });

    it('should throw UnauthorizedException for invalid client credentials', async () => {
      const { service, clienteAuthRepository } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoAcceso: TipoAccesoLogin.CLIENTE,
        correo: 'test@test.com',
        contrasena: 'wrongpassword',
      };

      clienteAuthRepository.findOne.resolves(null);

      await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid user credentials', async () => {
      const { service, usuariosService } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoAcceso: TipoAccesoLogin.ADMIN,
        correo: 'admin@test.com',
        contrasena: 'wrong',
      };

      usuariosService.findUsuarioByCorreo.resolves(null);

      await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong role', async () => {
      const { service, usuariosService } = await createTestingModule();
      moduleRefs.push(service);

      const dto = {
        tipoAcceso: TipoAccesoLogin.ADMIN,
        correo: 'user@test.com',
        contrasena: 'password',
      };

      const usuario = {
        rol: { nombre: RoleEnum.OPERADOR },
      };

      usuariosService.findUsuarioByCorreo.resolves(usuario);
      const bcryptStub = sinon.stub(bcrypt, 'compare').resolves(true);
      moduleRefs.push({ close: () => bcryptStub.restore() });

      await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
      bcryptStub.restore();
    });
  });
});