import { createTestingModule } from "./tarifas.service.spec";
import { NotFoundException } from '@nestjs/common';

describe('TarifasService - actualizar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // CONDICIONAL 1: tarifa existe
  // =====================================================

  it('CS0001 - actualiza correctamente cuando tarifa existe', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      precioFraccionHora: 100,
      precioHoraAdicional: 50,
      parqueadero: {},
      tipoVehiculo: {},
    };

    const tarifaActualizadaMock = { ...tarifaMock };

    tarifaRepository.findOne
      .mockResolvedValueOnce(tarifaMock)
      .mockResolvedValueOnce(tarifaActualizadaMock);

    tarifaRepository.save.mockResolvedValue(tarifaMock);

    const updateData = {};

    // Act
    const result = await service.actualizar(id, updateData as any);

    // Assert
    expect(tarifaRepository.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: ['parqueadero', 'tipoVehiculo'],
    });

    expect(result).toBe(tarifaActualizadaMock);
  });

  it('CS0002 - lanza NotFoundException cuando tarifa NO existe', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    tarifaRepository.findOne.mockResolvedValue(null);

    // Act
    const action = service.actualizar(id, {} as any);

    // Assert
    await expect(action).rejects.toThrow(NotFoundException);

    expect(tarifaRepository.save).not.toHaveBeenCalled();
  });

  // =====================================================
  // CONDICIONAL 2: precioFraccionHora definido
  // =====================================================

  it('CS0003 - actualiza precioFraccionHora cuando viene definido', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      precioFraccionHora: 100,
      precioHoraAdicional: 50,
      parqueadero: {},
      tipoVehiculo: {},
    };

    const tarifaActualizadaMock = { ...tarifaMock, precioFraccionHora: 200 };

    tarifaRepository.findOne
      .mockResolvedValueOnce(tarifaMock)
      .mockResolvedValueOnce(tarifaActualizadaMock);

    tarifaRepository.save.mockResolvedValue(tarifaMock);

    const updateData = {
      precioFraccionHora: 200,
    };

    // Act
    await service.actualizar(id, updateData as any);

    // Assert
    expect(tarifaMock.precioFraccionHora).toBe(200);
    expect(tarifaRepository.save).toHaveBeenCalledWith(tarifaMock);
  });

  it('CS0004 - NO actualiza precioFraccionHora cuando NO viene definido', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      precioFraccionHora: 100,
      precioHoraAdicional: 50,
      parqueadero: {},
      tipoVehiculo: {},
    };

    tarifaRepository.findOne
      .mockResolvedValueOnce(tarifaMock)
      .mockResolvedValueOnce(tarifaMock);

    tarifaRepository.save.mockResolvedValue(tarifaMock);

    const updateData = {};

    // Act
    await service.actualizar(id, updateData as any);

    // Assert
    expect(tarifaMock.precioFraccionHora).toBe(100);
  });

  // =====================================================
  // CONDICIONAL 3: precioHoraAdicional definido
  // =====================================================

  it('CS0005 - actualiza precioHoraAdicional cuando viene definido', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      precioFraccionHora: 100,
      precioHoraAdicional: 50,
      parqueadero: {},
      tipoVehiculo: {},
    };

    const tarifaActualizadaMock = { ...tarifaMock, precioHoraAdicional: 80 };

    tarifaRepository.findOne
      .mockResolvedValueOnce(tarifaMock)
      .mockResolvedValueOnce(tarifaActualizadaMock);

    tarifaRepository.save.mockResolvedValue(tarifaMock);

    const updateData = {
      precioHoraAdicional: 80,
    };

    // Act
    await service.actualizar(id, updateData as any);

    // Assert
    expect(tarifaMock.precioHoraAdicional).toBe(80);
    expect(tarifaRepository.save).toHaveBeenCalledWith(tarifaMock);
  });

  it('CS0006 - NO actualiza precioHoraAdicional cuando NO viene definido', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      precioFraccionHora: 100,
      precioHoraAdicional: 50,
      parqueadero: {},
      tipoVehiculo: {},
    };

    tarifaRepository.findOne
      .mockResolvedValueOnce(tarifaMock)
      .mockResolvedValueOnce(tarifaMock);

    tarifaRepository.save.mockResolvedValue(tarifaMock);

    const updateData = {};

    // Act
    await service.actualizar(id, updateData as any);

    // Assert
    expect(tarifaMock.precioHoraAdicional).toBe(50);
  });

  // =====================================================
  // CONDICIONAL 4: tarifaActualizada existe
  // =====================================================

  it('CS0007 - retorna tarifa actualizada cuando se recupera correctamente', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      parqueadero: {},
      tipoVehiculo: {},
    };

    const tarifaActualizadaMock = { ...tarifaMock };

    tarifaRepository.findOne
      .mockResolvedValueOnce(tarifaMock)
      .mockResolvedValueOnce(tarifaActualizadaMock);

    tarifaRepository.save.mockResolvedValue(tarifaMock);

    // Act
    const result = await service.actualizar(id, {} as any);

    // Assert
    expect(result).toBe(tarifaActualizadaMock);
  });

  it('CS0008 - lanza NotFoundException cuando NO se puede recuperar la tarifa actualizada', async () => {
    // Arrange
    const { service, tarifaRepository } = await createTestingModule();

    const id = 1;

    const tarifaMock = {
      id,
      parqueadero: {},
      tipoVehiculo: {},
    };

    tarifaRepository.findOne
      .mockResolvedValueOnce(tarifaMock)
      .mockResolvedValueOnce(null);

    tarifaRepository.save.mockResolvedValue(tarifaMock);

    // Act
    const action = service.actualizar(id, {} as any);

    // Assert
    await expect(action).rejects.toThrow(NotFoundException);
  });
});