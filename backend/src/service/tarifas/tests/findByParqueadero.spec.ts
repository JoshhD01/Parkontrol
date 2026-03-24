import { createTestingModule } from "./tarifas.service.spec";
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

describe('TarifasService - findByParqueadero', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // CONDICIONAL 1: idParqueadero válido
  // =====================================================

  it('CS0001 - retorna tarifas cuando idParqueadero es válido', async () => {
    // Arrange
    const {
      service,
      tarifaRepository,
      parqueaderosService,
    } = await createTestingModule();

    const idParqueadero = 1;

    const parqueaderoMock = { id: 1 };
    const tarifasMock = [
      { id: 1 },
      { id: 2 },
    ];

    parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
    tarifaRepository.find.mockResolvedValue(tarifasMock);

    // Act
    const result = await service.findByParqueadero(idParqueadero);

    // Assert
    expect(parqueaderosService.findParqueaderoById).toHaveBeenCalledWith(1);

    expect(tarifaRepository.find).toHaveBeenCalledWith({
      where: { parqueadero: { id: 1 } },
      relations: ['parqueadero', 'tipoVehiculo'],
    });

    expect(result).toBe(tarifasMock);
  });

  it('CS0002 - lanza BadRequestException cuando idParqueadero es inválido', async () => {
    // Arrange
    const { service, tarifaRepository, parqueaderosService } =
      await createTestingModule();

    const idParqueadero = 0;

    // Act
    const action = service.findByParqueadero(idParqueadero);

    // Assert
    await expect(action).rejects.toThrow(BadRequestException);

    expect(parqueaderosService.findParqueaderoById).not.toHaveBeenCalled();
    expect(tarifaRepository.find).not.toHaveBeenCalled();
  });

  // =====================================================
  // CONDICIONAL 2: parqueadero existe
  // =====================================================

  it('CS0003 - retorna tarifas cuando parqueadero existe', async () => {
    // Arrange
    const {
      service,
      tarifaRepository,
      parqueaderosService,
    } = await createTestingModule();

    const idParqueadero = 1;

    const parqueaderoMock = { id: 1 };
    const tarifasMock = [{ id: 1 }];

    parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
    tarifaRepository.find.mockResolvedValue(tarifasMock);

    // Act
    const result = await service.findByParqueadero(idParqueadero);

    // Assert
    expect(parqueaderosService.findParqueaderoById).toHaveBeenCalledWith(1);
    expect(tarifaRepository.find).toHaveBeenCalled();

    expect(result).toBe(tarifasMock);
  });

  it('CS0004 - lanza NotFoundException cuando parqueadero NO existe', async () => {
    // Arrange
    const {
      service,
      parqueaderosService,
      tarifaRepository,
    } = await createTestingModule();

    const idParqueadero = 1;

    parqueaderosService.findParqueaderoById.mockResolvedValue(null);

    // Act
    const action = service.findByParqueadero(idParqueadero);

    // Assert
    await expect(action).rejects.toThrow(NotFoundException);

    expect(parqueaderosService.findParqueaderoById).toHaveBeenCalledWith(1);
    expect(tarifaRepository.find).not.toHaveBeenCalled();
  });
});