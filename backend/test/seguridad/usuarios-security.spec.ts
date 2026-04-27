import { UsuariosController } from 'src/controller/usuarios/usuarios.controller';

describe('UsuariosController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user through UsuariosService', async () => {
    const usuariosService = {
      crear: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new UsuariosController(usuariosService);

    const result = await controller.crear({ rol: 'ADMIN' } as any);

    expect(result).toEqual({ id: 1 });
    expect(usuariosService.crear).toHaveBeenCalledWith({ rol: 'ADMIN' } as any, 'ADMIN');
  });

  it('should change password through UsuariosService', async () => {
    const usuariosService = {
      cambiarContrasena: jest.fn().mockResolvedValue({ mensaje: 'OK' }),
    } as any;
    const controller = new UsuariosController(usuariosService);
    const user = { id: 2 } as any;

    const result = await controller.cambiarContrasena(user, {
      contrasenaActual: 'old',
      contrasenaNueva: 'new',
    } as any);

    expect(result).toEqual({ mensaje: 'OK' });
    expect(usuariosService.cambiarContrasena).toHaveBeenCalledWith(2, expect.any(Object));
  });
});
