import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/auth/auth.service.module';
import { TipoAccesoLogin } from 'src/controller/auth/dto/login-usuario.dto';
import { RoleEnum } from 'src/entities/shared';
import * as bcrypt from 'bcrypt';

describe('AuthService Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarCliente', () => {
    it('should register a new client successfully', async () => {
      const { service, clienteFacturaRepository, clienteAuthRepository } = await createTestingModule();

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

    it('should throw BadRequestException if document is associated with different email', async () => {
      const { service, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123456789',
        correo: 'test@test.com',
        contrasena: 'password123',
      };

      clienteFacturaRepository.findOne.resolves({ correo: 'other@test.com' });

      await expect(service.registrarCliente(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login client successfully', async () => {
      const { service, clienteAuthRepository } = await createTestingModule();

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(dto as any);

      expect(result).toEqual({ access_token: 'token-jwt' });
    });

    it('should throw UnauthorizedException for invalid client credentials', async () => {
      const { service, clienteAuthRepository } = await createTestingModule();

      const dto = {
        tipoAcceso: TipoAccesoLogin.CLIENTE,
        correo: 'test@test.com',
        contrasena: 'wrongpassword',
      };

      clienteAuthRepository.findOne.resolves(null);

      await expect(service.login(dto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should login admin successfully', async () => {
      const { service, usuariosService } = await createTestingModule();

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(dto as any);

      expect(result).toEqual({ access_token: 'token-jwt' });
    });
  });
});