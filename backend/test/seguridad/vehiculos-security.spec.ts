import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehiculosController } from 'src/controller/vehiculos/vehiculos.controller';

describe('VehiculosController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch vehicle by valid placa through VehiculosService', async () => {
    const vehiculosService = {
      findByPlaca: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new VehiculosController(vehiculosService);

    const result = await controller.obtenerPorPlaca('ABC123');

    expect(result).toEqual({ id: 1 });
    expect(vehiculosService.findByPlaca).toHaveBeenCalledWith('ABC123');
  });

  it('should throw BadRequestException for invalid placa input', async () => {
    const vehiculosService = {
      findByPlaca: jest.fn(),
    } as any;
    const controller = new VehiculosController(vehiculosService);

    await expect(controller.obtenerPorPlaca('bad')).rejects.toThrow(BadRequestException);
    expect(vehiculosService.findByPlaca).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when vehicle is missing', async () => {
    const vehiculosService = {
      findByPlaca: jest.fn().mockResolvedValue(null),
    } as any;
    const controller = new VehiculosController(vehiculosService);

    await expect(controller.obtenerPorPlaca('ABC123')).rejects.toThrow(NotFoundException);
    expect(vehiculosService.findByPlaca).toHaveBeenCalledWith('ABC123');
  });
});
