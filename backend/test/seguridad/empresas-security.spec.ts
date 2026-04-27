import { EmpresasController } from 'src/controller/empresas/empresas.controller';

describe('EmpresasController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return company details using EmpresasService', async () => {
    const empresasService = {
      obtenerDetalle: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new EmpresasController(empresasService);

    const result = await controller.obtenerDetalle(1);

    expect(result).toEqual({ id: 1 });
    expect(empresasService.obtenerDetalle).toHaveBeenCalledWith(1);
  });

  it('should return all companies through EmpresasService', async () => {
    const empresasService = {
      obtenerTodas: jest.fn().mockResolvedValue([{ id: 1 }]),
    } as any;
    const controller = new EmpresasController(empresasService);

    const result = await controller.obtenerTodas();

    expect(result).toEqual([{ id: 1 }]);
    expect(empresasService.obtenerTodas).toHaveBeenCalled();
  });
});
