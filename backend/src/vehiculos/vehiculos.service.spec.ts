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

  it('CS00001 - debe lanzar ConflictException si findOne retorna objeto vacío', async () => {

    // Arrange
    vehiculoRepository.findOne.mockResolvedValue({} as any);

    // Act
    const action = service.crear(dto);

    // Assert
    await expect(action).rejects.toThrow(
      `Ya existe un vehículo con placa: ${dto.placa}`,
    );

    expect(tipoVehiculoRepository.findOne).not.toHaveBeenCalled();
    expect(vehiculoRepository.save).not.toHaveBeenCalled();
  });


  it('CS00002 - debe lanzar ConflictException si ya existe la placa', async () => {

    // Arrange
    vehiculoRepository.findOne.mockResolvedValue({ id: 99 } as any);

    // Act
    const action = service.crear(dto);

    // Assert
    await expect(action).rejects.toThrow(
      `Ya existe un vehículo con placa: ${dto.placa}`,
    );

    expect(tipoVehiculoRepository.findOne).not.toHaveBeenCalled();
  });


  it('CS00003 - debe lanzar NotFoundException si tipoVehiculo es objeto vacío', async () => {

    // Arrange
    vehiculoRepository.findOne.mockResolvedValue(null);
    tipoVehiculoRepository.findOne.mockResolvedValue({} as any);

    vehiculoRepository.create.mockReturnValue({} as any);

    // Act
    const result = await service.crear(dto);

    // Assert
    expect(vehiculoRepository.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });


  it('CS00004 - debe lanzar NotFoundException si tipoVehiculo no existe', async () => {

    // Arrange
    vehiculoRepository.findOne.mockResolvedValue(null);
    tipoVehiculoRepository.findOne.mockResolvedValue(null);

    // Act
    const action = service.crear(dto);

    // Assert
    await expect(action).rejects.toThrow(
      `No existe tipo de vehículo con id: ${dto.idTipoVehiculo}`,
    );

    expect(vehiculoRepository.save).not.toHaveBeenCalled();
  });


  it('CS00005 - debe lanzar error si falla el guardado en DB', async () => {

    // Arrange
    vehiculoRepository.findOne.mockResolvedValue(null);
    tipoVehiculoRepository.findOne.mockResolvedValue(tipoVehiculoMock);

    const vehiculoCreado = { placa: 'ABC123' };

    vehiculoRepository.create.mockReturnValue(vehiculoCreado);

    vehiculoRepository.save.mockRejectedValue(
      new Error('Error de conexión DB'),
    );

    // Act
    const action = service.crear(dto);

    // Assert
    await expect(action).rejects.toThrow(
      'Error de conexión DB',
    );
  });


  it('CS00006 - debe retornar objeto vacío si save retorna vacío', async () => {

    // Arrange
    vehiculoRepository.findOne.mockResolvedValue(null);
    tipoVehiculoRepository.findOne.mockResolvedValue(tipoVehiculoMock);

    vehiculoRepository.create.mockReturnValue({} as any);
    vehiculoRepository.save.mockResolvedValue({} as any);

    // Act
    const result = await service.crear(dto);

    // Assert
    expect(result).toEqual({});
  });

});


});