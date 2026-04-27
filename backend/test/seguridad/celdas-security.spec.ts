import { CeldasController } from 'src/controller/celdas/celdas.controller';

describe('CeldasController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a cell using the CeldasService', async () => {
    const celdasService = {
      crear: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new CeldasController(celdasService);

    const result = await controller.crear({} as any);

    expect(result).toEqual({ id: 1 });
    expect(celdasService.crear).toHaveBeenCalledWith({} as any);
  });

  it('should fetch a cell by id through the service', async () => {
    const celdasService = {
      findCeldaById: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new CeldasController(celdasService);

    const result = await controller.obtenerPorId(1);

    expect(result).toEqual({ id: 1 });
    expect(celdasService.findCeldaById).toHaveBeenCalledWith(1);
  });
});
