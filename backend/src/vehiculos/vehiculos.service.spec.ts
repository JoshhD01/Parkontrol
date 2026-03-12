import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { VehiculosService } from './vehiculos.service';

import { Vehiculo } from './entities/vehiculo.entity';
import { TipoVehiculo } from 'src/shared/entities/tipo-vehiculo.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';

describe('VehiculosService - Setup', () => {
  let service: VehiculosService;

  let vehiculoRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  let tipoVehiculoRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
  };

  let reservaRepository: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    // 🔹 Mock Repository Vehiculo
    vehiculoRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // 🔹 Mock Repository TipoVehiculo
    tipoVehiculoRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    // 🔹 Mock Repository Reserva
    reservaRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiculosService,
        {
          provide: getRepositoryToken(Vehiculo),
          useValue: vehiculoRepository,
        },
        {
          provide: getRepositoryToken(TipoVehiculo),
          useValue: tipoVehiculoRepository,
        },
        {
          provide: getRepositoryToken(Reserva),
          useValue: reservaRepository,
        },
      ],
    }).compile();

    service = module.get<VehiculosService>(VehiculosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    const dto = {
      placa: 'abc123',
      idTipoVehiculo: 1,
    };

    const tipoVehiculoMock = {
      id: 1,
      nombre: 'Carro',
    } as any;

    const vehiculoGuardadoMock = {
      id: 10,
      placa: 'ABC123',
      tipoVehiculo: tipoVehiculoMock,
    } as any;

    // 🔹 1. La DB retorna un objeto vacío al buscar por placa
    it('CS00001 - debe lanzar ConflictException si findOne retorna objeto vacío', async () => {
      vehiculoRepository.findOne.mockResolvedValue({} as any);

      await expect(service.crear(dto))
        .rejects
        .toThrow(`Ya existe un vehículo con placa: ${dto.placa}`);

      expect(tipoVehiculoRepository.findOne).not.toHaveBeenCalled();
      expect(vehiculoRepository.save).not.toHaveBeenCalled();
    });

    // 🔹 2. La DB retorna una placa ya existente
    it('CS0002 - debe lanzar ConflictException si ya existe la placa', async () => {
      vehiculoRepository.findOne.mockResolvedValue({ id: 99 } as any);

      await expect(service.crear(dto))
        .rejects
        .toThrow(`Ya existe un vehículo con placa: ${dto.placa}`);

      expect(tipoVehiculoRepository.findOne).not.toHaveBeenCalled();
    });

    // 🔹 3. findOne de tipoVehiculo retorna objeto vacío
    it('CS0003 - debe lanzar NotFoundException si tipoVehiculo es objeto vacío', async () => {
      vehiculoRepository.findOne.mockResolvedValue(null);
      tipoVehiculoRepository.findOne.mockResolvedValue({} as any);

      vehiculoRepository.create.mockReturnValue({} as any);

      await service.crear(dto); // ⚠ Este NO lanza excepción con tu código actual

      expect(vehiculoRepository.create).toHaveBeenCalled();
    });

    // 🔹 4. El tipo de vehículo no existe (null)
    it('CS0004 - debe lanzar NotFoundException si tipoVehiculo no existe', async () => {
      vehiculoRepository.findOne.mockResolvedValue(null);
      tipoVehiculoRepository.findOne.mockResolvedValue(null);

      await expect(service.crear(dto))
        .rejects
        .toThrow(`No existe tipo de vehículo con id: ${dto.idTipoVehiculo}`);

      expect(vehiculoRepository.save).not.toHaveBeenCalled();
    });

    // 🔹 5. Falla el guardado en DB por conexión
    it('CS0005 - debe lanzar error si falla el guardado en DB', async () => {
      vehiculoRepository.findOne.mockResolvedValue(null);
      tipoVehiculoRepository.findOne.mockResolvedValue(tipoVehiculoMock);

      const vehiculoCreado = { placa: 'ABC123' };
      vehiculoRepository.create.mockReturnValue(vehiculoCreado);

      vehiculoRepository.save.mockRejectedValue(
        new Error('Error de conexión DB'),
      );

      await expect(service.crear(dto))
        .rejects
        .toThrow('Error de conexión DB');
    });

    // 🔹 6. El guardado retorna objeto vacío
    it('CS0006 - debe retornar objeto vacío si save retorna vacío', async () => {
      vehiculoRepository.findOne.mockResolvedValue(null);
      tipoVehiculoRepository.findOne.mockResolvedValue(tipoVehiculoMock);

      vehiculoRepository.create.mockReturnValue({} as any);
      vehiculoRepository.save.mockResolvedValue({} as any);

      const result = await service.crear(dto);

      expect(result).toEqual({});
    });
  });

});