import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VistasController } from 'src/controller/vistas/vistas.controller';

describe('VistasController Security Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject invalid placa when searching by placa', async () => {
    const vistasService = {
      buscarVehiculoPorPlaca: jest.fn(),
    } as any;
    const controller = new VistasController(vistasService);

    await expect(controller.buscarVehiculoPorPlaca('bad')).rejects.toThrow(BadRequestException);
    expect(vistasService.buscarVehiculoPorPlaca).not.toHaveBeenCalled();
  });

  it('should fetch vehicle by valid placa through VistasService', async () => {
    const vistasService = {
      buscarVehiculoPorPlaca: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new VistasController(vistasService);

    const result = await controller.buscarVehiculoPorPlaca('ABC123');

    expect(result).toEqual({ id: 1 });
    expect(vistasService.buscarVehiculoPorPlaca).toHaveBeenCalledWith('ABC123');
  });

  it('should throw NotFoundException when parqueadero ocupacion is not found', async () => {
    const vistasService = {
      getOcupacionByParqueadero: jest.fn().mockResolvedValue(null),
    } as any;
    const controller = new VistasController(vistasService);

    await expect(controller.getOcupacionByParqueadero(5)).rejects.toThrow(NotFoundException);
    expect(vistasService.getOcupacionByParqueadero).toHaveBeenCalledWith(5);
  });
});
