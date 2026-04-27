import { ForbiddenException } from '@nestjs/common';
import { AuthController } from 'src/controller/auth/auth.controller';

describe('AuthController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject register admin disabled immediately', () => {
    const controller = new AuthController({} as any);
    const start = Date.now();

    expect(() => controller.registerAdminDisabled()).toThrow(ForbiddenException);
    expect(Date.now() - start).toBeLessThan(100);
  });

  it('should delegate login to authService', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue({ access_token: 'token' }),
    } as any;
    const controller = new AuthController(authService);

    const result = await controller.login({ correo: 'test@example.com', contrasena: '12345' } as any);

    expect(result).toEqual({ access_token: 'token' });
    expect(authService.login).toHaveBeenCalledWith({ correo: 'test@example.com', contrasena: '12345' });
  });
});
