import { createTestingModule } from "./tarifas.service.spec";
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

describe('TarifasService - findTarifaById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // CONDICIONAL 1: id válido
  // =====================================================

  it('CS0001 - retorna tarifa cuando id es válido', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      parqueadero: {},
      tipoVehiculo: {},
    };

    tarifaRepository.findOne.mockResolvedValue(tarifaMock);

    // Act
    const result = await service.findTarifaById(id);

    // Assert
    expect(tarifaRepository.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: ['parqueadero', 'tipoVehiculo'],
    });

    expect(result).toBe(tarifaMock);
  });

  it('CS0002 - lanza BadRequestException cuando id es inválido', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 0;

    // Act
    const action = service.findTarifaById(id);

    // Assert
    await expect(action).rejects.toThrow(BadRequestException);

    expect(tarifaRepository.findOne).not.toHaveBeenCalled();
  });

  // =====================================================
  // CONDICIONAL 2: tarifa existe
  // =====================================================

  it('CS0003 - retorna tarifa cuando existe en base de datos', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      parqueadero: {},
      tipoVehiculo: {},
    };

    tarifaRepository.findOne.mockResolvedValue(tarifaMock);

    // Act
    const result = await service.findTarifaById(id);

    // Assert
    expect(result).toBe(tarifaMock);
  });

  it('CS0004 - lanza NotFoundException cuando tarifa NO existe', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    tarifaRepository.findOne.mockResolvedValue(null);

    // Act
    const action = service.findTarifaById(id);

    // Assert
    await expect(action).rejects.toThrow(NotFoundException);

    expect(tarifaRepository.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: ['parqueadero', 'tipoVehiculo'],
    });
  });
});