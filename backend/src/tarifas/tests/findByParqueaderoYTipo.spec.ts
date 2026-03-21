import { createTestingModule } from "./tarifas.service.spec";
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

describe('TarifasService - findByParqueaderoYTipo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // CONDICIONAL 1: idParqueadero válido
  // =====================================================

  it('CS0001 - retorna tarifa cuando idParqueadero es válido', async () => {
    // Arrange
    const {
      service,
      tarifaRepository,
      parqueaderosService,
      tipoVehiculoRepository,
    } = await createTestingModule();

    const tarifaMock = { id: 1 };

    parqueaderosService.findParqueaderoById.mockResolvedValue({ id: 1 });
    tipoVehiculoRepository.findOne.mockResolvedValue({ id: 1 });
    tarifaRepository.findOne.mockResolvedValue(tarifaMock);

    // Act
    const result = await service.findByParqueaderoYTipo(1, 1);

    // Assert
    expect(result).toBe(tarifaMock);
  });

  it('CS0002 - lanza BadRequestException cuando idParqueadero es inválido', async () => {
    // Arrange
    const { service } = await createTestingModule();

    // Act
    const action = service.findByParqueaderoYTipo(0, 1);

    // Assert
    await expect(action).rejects.toThrow(BadRequestException);
  });

  // =====================================================
  // CONDICIONAL 2: idTipoVehiculo válido
  // =====================================================

  it('CS0003 - continúa ejecución cuando idTipoVehiculo es válido', async () => {
    // Arrange
    const {
      service,
      tarifaRepository,
      parqueaderosService,
      tipoVehiculoRepository,
    } = await createTestingModule();

    parqueaderosService.findParqueaderoById.mockResolvedValue({ id: 1 });
    tipoVehiculoRepository.findOne.mockResolvedValue({ id: 1 });
    tarifaRepository.findOne.mockResolvedValue({ id: 1 });

    // Act
    const result = await service.findByParqueaderoYTipo(1, 1);

    // Assert
    expect(result).toBeDefined();
  });

  it('CS0004 - lanza BadRequestException cuando idTipoVehiculo es inválido', async () => {
    // Arrange
    const { service } = await createTestingModule();

    // Act
    const action = service.findByParqueaderoYTipo(1, 0);

    // Assert
    await expect(action).rejects.toThrow(BadRequestException);
  });

  // =====================================================
  // CONDICIONAL 3: parqueadero existe
  // =====================================================

  it('CS0005 - continúa cuando parqueadero existe', async () => {
    // Arrange
    const {
      service,
      tarifaRepository,
      parqueaderosService,
      tipoVehiculoRepository,
    } = await createTestingModule();

    parqueaderosService.findParqueaderoById.mockResolvedValue({ id: 1 });
    tipoVehiculoRepository.findOne.mockResolvedValue({ id: 1 });
    tarifaRepository.findOne.mockResolvedValue({ id: 1 });

    // Act
    const result = await service.findByParqueaderoYTipo(1, 1);

    // Assert
    expect(parqueaderosService.findParqueaderoById).toHaveBeenCalledWith(1);
    expect(result).toBeDefined();
  });

  it('CS0006 - lanza NotFoundException cuando parqueadero NO existe', async () => {
    // Arrange
    const { service, parqueaderosService } =
      await createTestingModule();

    parqueaderosService.findParqueaderoById.mockResolvedValue(null);

    // Act
    const action = service.findByParqueaderoYTipo(1, 1);

    // Assert
    await expect(action).rejects.toThrow(NotFoundException);
  });

  // =====================================================
  // CONDICIONAL 4: tipoVehiculo existe
  // =====================================================

  it('CS0007 - continúa cuando tipoVehiculo existe', async () => {
    // Arrange
    const {
      service,
      tarifaRepository,
      parqueaderosService,
      tipoVehiculoRepository,
    } = await createTestingModule();

    parqueaderosService.findParqueaderoById.mockResolvedValue({ id: 1 });
    tipoVehiculoRepository.findOne.mockResolvedValue({ id: 1 });
    tarifaRepository.findOne.mockResolvedValue({ id: 1 });

    // Act
    const result = await service.findByParqueaderoYTipo(1, 1);

    // Assert
    expect(tipoVehiculoRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(result).toBeDefined();
  });

  it('CS0008 - lanza NotFoundException cuando tipoVehiculo NO existe', async () => {
    // Arrange
    const {
      service,
      parqueaderosService,
      tipoVehiculoRepository,
    } = await createTestingModule();

    parqueaderosService.findParqueaderoById.mockResolvedValue({ id: 1 });
    tipoVehiculoRepository.findOne.mockResolvedValue(null);

    // Act
    const action = service.findByParqueaderoYTipo(1, 1);

    // Assert
    await expect(action).rejects.toThrow(NotFoundException);
  });
});