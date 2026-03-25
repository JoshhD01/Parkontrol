import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { VehiculosService } from './vehiculos.service';
import { Vehiculo } from 'src/entities/vehiculos/entities/vehiculo.entity';
import { TipoVehiculo } from 'src/entities/shared/entities/tipo-vehiculo.entity';
import { Reserva } from 'src/entities/reservas/entities/reserva.entity';

describe('VehiculosService', () => {
  let service: VehiculosService;

  let vehiculoRepository: any;
  let tipoVehiculoRepository: any;
  let reservaRepository: any;

  beforeEach(async () => {
    vehiculoRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    tipoVehiculoRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    reservaRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiculosService,
        { provide: getRepositoryToken(Vehiculo), useValue: vehiculoRepository },
        { provide: getRepositoryToken(TipoVehiculo), useValue: tipoVehiculoRepository },
        { provide: getRepositoryToken(Reserva), useValue: reservaRepository },
      ],
    }).compile();

    service = module.get<VehiculosService>(VehiculosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const vehiculoMock = { id: 1, placa: 'ABC123' };
  const tipoVehiculoMock = { id: 1 };

  // ============================
  // CREAR
  // ============================
  describe('crear', () => {

    it('CS0001 - ya existe vehículo', async () => {

      // Arrange
      vehiculoRepository.findOne.mockResolvedValue(vehiculoMock);

      // Act
      const action = service.crear({
        placa: 'abc123',
        idTipoVehiculo: 1,
      } as any);

      // Assert
      await expect(action).rejects.toThrow(
        'Ya existe un vehículo con placa: abc123',
      );
    });

    it('CS0002 - vehículo no existe', async () => {

      // Arrange
      vehiculoRepository.findOne.mockResolvedValue(null);
      tipoVehiculoRepository.findOne.mockResolvedValue(tipoVehiculoMock);

      vehiculoRepository.create.mockReturnValue(vehiculoMock);
      vehiculoRepository.save.mockResolvedValue(vehiculoMock);

      // Act
      const result = await service.crear({
        placa: 'abc123',
        idTipoVehiculo: 1,
      } as any);

      // Assert
      expect(result).toBeDefined();
      expect(vehiculoRepository.save).toHaveBeenCalled();
    });

    it('CS0003 - tipoVehiculo no existe', async () => {

      // Arrange
      vehiculoRepository.findOne.mockResolvedValue(null);
      tipoVehiculoRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.crear({
        placa: 'abc123',
        idTipoVehiculo: 99,
      } as any);

      // Assert
      await expect(action).rejects.toThrow(
        'No existe tipo de vehículo con id: 99',
      );
    });

    it('CS0004 - tipoVehiculo existe', async () => {

      // Arrange
      vehiculoRepository.findOne.mockResolvedValue(null);
      tipoVehiculoRepository.findOne.mockResolvedValue(tipoVehiculoMock);

      vehiculoRepository.create.mockReturnValue({
        ...vehiculoMock,
        placa: 'ABC123',
      });

      vehiculoRepository.save.mockResolvedValue(vehiculoMock);

      // Act
      const result = await service.crear({
        placa: 'abc123',
        idTipoVehiculo: 1,
      } as any);

      // Assert
      expect(result).toBeDefined();
      expect(vehiculoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          placa: 'ABC123',
        }),
      );
    });

  });

  // ============================
  // findByPlaca
  // ============================
  describe('findByPlaca', () => {

    it('CS0001 - encuentra vehículo', async () => {

      // Arrange
      vehiculoRepository.findOne.mockResolvedValue(vehiculoMock);

      // Act
      const result = await service.findByPlaca('abc123');

      // Assert
      expect(result).toBeDefined();
    });

    it('CS0002 - no encuentra vehículo', async () => {

      // Arrange
      vehiculoRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByPlaca('abc123');

      // Assert
      expect(result).toBeNull();
    });

  });

  // ============================
  // findVehiculoById
  // ============================
  describe('findVehiculoById', () => {

    it('CS0001 - no existe vehículo', async () => {

      // Arrange
      vehiculoRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.findVehiculoById(1);

      // Assert
      await expect(action).rejects.toThrow(
        'No existe vehículo con id: 1',
      );
    });

    it('CS0002 - existe vehículo', async () => {

      // Arrange
      vehiculoRepository.findOne.mockResolvedValue(vehiculoMock);

      // Act
      const result = await service.findVehiculoById(1);

      // Assert
      expect(result).toBeDefined();
    });

  });

  // ============================
  // findReservasByVehiculo
  // ============================
  describe('findReservasByVehiculo', () => {

    it('CS0001 - vehículo no existe', async () => {

      // Arrange
      jest.spyOn(service, 'findVehiculoById').mockRejectedValue(
        new Error('No existe vehículo con id: 1'),
      );

      // Act
      const action = service.findReservasByVehiculo(1);

      // Assert
      await expect(action).rejects.toThrow();
    });

    it('CS0002 - retorna reservas', async () => {

      // Arrange
      jest.spyOn(service, 'findVehiculoById').mockResolvedValue(vehiculoMock as any);

      reservaRepository.find.mockResolvedValue([{ id: 1 }]);

      // Act
      const result = await service.findReservasByVehiculo(1);

      // Assert
      expect(result).toHaveLength(1);
    });

    it('CS0003 - retorna vacío', async () => {

      // Arrange
      jest.spyOn(service, 'findVehiculoById').mockResolvedValue(vehiculoMock as any);

      reservaRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findReservasByVehiculo(1);

      // Assert
      expect(result).toHaveLength(0);
    });

  });

  // ============================
  // findAllTiposVehiculo
  // ============================
  describe('findAllTiposVehiculo', () => {

    it('CS0001 - retorna tipos', async () => {

      // Arrange
      tipoVehiculoRepository.find.mockResolvedValue([tipoVehiculoMock]);

      // Act
      const result = await service.findAllTiposVehiculo();

      // Assert
      expect(result).toHaveLength(1);
    });

    it('CS0002 - retorna vacío', async () => {

      // Arrange
      tipoVehiculoRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAllTiposVehiculo();

      // Assert
      expect(result).toHaveLength(0);
    });

  });

});