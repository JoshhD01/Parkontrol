import { TarifasController } from 'src/controller/tarifas/tarifas.controller';

describe('TarifasController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a rate through TarifasService', async () => {
    const tarifasService = {
      crear: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new TarifasController(tarifasService);

    const result = await controller.crear({} as any);

    expect(result).toEqual({ id: 1 });
    expect(tarifasService.crear).toHaveBeenCalledWith({} as any);
  });

  it('should fetch rates by parking lot through service', async () => {
    const tarifasService = {
      findByParqueadero: jest.fn().mockResolvedValue([{ id: 1 }]),
    } as any;
    const controller = new TarifasController(tarifasService);

    const result = await controller.obtenerPorParqueadero(1);

    expect(result).toEqual([{ id: 1 }]);
    expect(tarifasService.findByParqueadero).toHaveBeenCalledWith(1);
  });
});
