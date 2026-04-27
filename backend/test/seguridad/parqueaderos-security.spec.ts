import { ParqueaderosController } from 'src/controller/parqueaderos/parqueaderos.controller';

describe('ParqueaderosController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch available parking lots through the service', async () => {
    const parqueaderosService = {
      findAllConDisponibilidad: jest.fn().mockResolvedValue([{ id: 1 }]),
    } as any;
    const controller = new ParqueaderosController(parqueaderosService);

    const result = await controller.obtenerDisponiblesParaCliente();

    expect(result).toEqual([{ id: 1 }]);
    expect(parqueaderosService.findAllConDisponibilidad).toHaveBeenCalled();
  });

  it('should return parking lot details by id through the service', async () => {
    const parqueaderosService = {
      obtenerDetalle: jest.fn().mockResolvedValue({ id: 2 }),
    } as any;
    const controller = new ParqueaderosController(parqueaderosService);

    const result = await controller.obtenerDetalle(2);

    expect(result).toEqual({ id: 2 });
    expect(parqueaderosService.obtenerDetalle).toHaveBeenCalledWith(2);
  });
});
