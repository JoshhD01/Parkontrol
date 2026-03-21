import { createTestingModule } from "./tarifas.service.spec";
import { NotFoundException } from '@nestjs/common';

describe('TarifasService - crear', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // CONDICIONAL: tipoVehiculo existe
  // =====================================================

  it('CS0001 - crea tarifa correctamente cuando tipoVehiculo existe', async () => {
    // Arrange
    const {
      service,
      tarifaRepository,
      tipoVehiculoRepository,
      parqueaderosService,
    } = await createTestingModule();

    const dto = {
      idParqueadero: 1,
      idTipoVehiculo: 1,
      precioFraccionHora: 1000,
      precioHoraAdicional: 500,
    };

    const parqueaderoMock = { id: 1 };
    const tipoVehiculoMock = { id: 1 };
    const tarifaMock = {
      id: 10,
      parqueadero: parqueaderoMock,
      tipoVehiculo: tipoVehiculoMock,
      ...dto,
    };

    parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
    tipoVehiculoRepository.findOne.mockResolvedValue(tipoVehiculoMock);

    tarifaRepository.create.mockReturnValue(tarifaMock);
    tarifaRepository.save.mockResolvedValue(tarifaMock);

    // Act
    const result = await service.crear(dto as any);

    // Assert
    expect(parqueaderosService.findParqueaderoById).toHaveBeenCalledWith(1);
    expect(tipoVehiculoRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(tarifaRepository.create).toHaveBeenCalledWith({
      parqueadero: parqueaderoMock,
      tipoVehiculo: tipoVehiculoMock,
      precioFraccionHora: 1000,
      precioHoraAdicional: 500,
    });

    expect(tarifaRepository.save).toHaveBeenCalledWith(tarifaMock);

    expect(result).toBe(tarifaMock);
  });

  it('CS0002 - lanza NotFoundException cuando tipoVehiculo NO existe', async () => {
    // Arrange
    const {
      service,
      tipoVehiculoRepository,
      parqueaderosService,
      tarifaRepository,
    } = await createTestingModule();

    const dto = {
      idParqueadero: 1,
      idTipoVehiculo: 99,
      precioFraccionHora: 1000,
      precioHoraAdicional: 500,
    };

    const parqueaderoMock = { id: 1 };

    parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
    tipoVehiculoRepository.findOne.mockResolvedValue(null);

    // Act
    const action = service.crear(dto as any);

    // Assert
    await expect(action).rejects.toThrow(NotFoundException);

    expect(parqueaderosService.findParqueaderoById).toHaveBeenCalledWith(1);
    expect(tipoVehiculoRepository.findOne).toHaveBeenCalledWith({
      where: { id: 99 },
    });

    expect(tarifaRepository.create).not.toHaveBeenCalled();
    expect(tarifaRepository.save).not.toHaveBeenCalled();
  });
});