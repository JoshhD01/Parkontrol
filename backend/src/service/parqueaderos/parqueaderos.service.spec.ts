import { Test, TestingModule } from '@nestjs/testing';
import { ParqueaderosService } from './parqueaderos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Parqueadero } from 'src/entities/parqueaderos/entities/parqueadero.entity';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { TipoCelda } from 'src/entities/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/entities/shared/entities/sensor.entity';
import { EmpresasService } from 'src/service/empresas/empresas.service';
import { NotFoundException } from '@nestjs/common';

describe('ParqueaderosService', () => {
  let service: ParqueaderosService;

  const parqueaderoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const celdaRepository = {
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const tipoCeldaRepository = {
    findOne: jest.fn(),
  };

  const sensorRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const empresasServiceMock = {
    findEmpresaById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParqueaderosService,
        {
          provide: getRepositoryToken(Parqueadero),
          useValue: parqueaderoRepository,
        },
        {
          provide: getRepositoryToken(Celda),
          useValue: celdaRepository,
        },
        {
          provide: getRepositoryToken(TipoCelda),
          useValue: tipoCeldaRepository,
        },
        {
          provide: getRepositoryToken(Sensor),
          useValue: sensorRepository,
        },
        {
          provide: EmpresasService,
          useValue: empresasServiceMock,
        },
      ],
    }).compile();

    service = module.get<ParqueaderosService>(ParqueaderosService);
  });

  // ✅ TEST 1: crear parqueadero correctamente
  it('debería crear un parqueadero y generar celdas', async () => {
    const dto = {
      nombre: 'Parking Test',
      capacidadTotal: 2,
      ubicacion: 'Centro',
      idEmpresa: 1,
    };

    const empresaMock = { id: 1 };
    const parqueaderoMock = { id: 10, ...dto, empresa: empresaMock };

    empresasServiceMock.findEmpresaById.mockResolvedValue(empresaMock);

    parqueaderoRepository.create.mockReturnValue(parqueaderoMock);
    parqueaderoRepository.save.mockResolvedValue(parqueaderoMock);

    celdaRepository.count.mockResolvedValue(0);

    tipoCeldaRepository.findOne
      .mockResolvedValueOnce(null) // no encuentra PARTICULAR
      .mockResolvedValueOnce({ id: 1, nombre: 'DEFAULT' });

    sensorRepository.create.mockImplementation((data) => data);
    sensorRepository.save.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    celdaRepository.create.mockImplementation((data) => data);
    celdaRepository.save.mockResolvedValue([]);

    const result = await service.crear(dto as any);

    expect(result).toBeDefined();
    expect(parqueaderoRepository.save).toHaveBeenCalled();
    expect(sensorRepository.save).toHaveBeenCalled();
    expect(celdaRepository.save).toHaveBeenCalled();
  });

  // ✅ TEST 2: no crear celdas si ya hay suficientes
  it('no debería crear celdas si ya cumple la capacidad', async () => {
    const parqueadero = { id: 1, capacidadTotal: 2 };

    celdaRepository.count.mockResolvedValue(2);

    await (service as any).asegurarCapacidadCeldas(parqueadero);

    expect(sensorRepository.save).not.toHaveBeenCalled();
    expect(celdaRepository.save).not.toHaveBeenCalled();
  });

  // ✅ TEST 3: lanzar error si no hay tipo de celda
  it('debería lanzar error si no existe tipo de celda', async () => {
    const parqueadero = { id: 1, capacidadTotal: 1 };

    celdaRepository.count.mockResolvedValue(0);

    tipoCeldaRepository.findOne
      .mockResolvedValueOnce(null) // PARTICULAR
      .mockResolvedValueOnce(null); // fallback

    await expect(
      (service as any).asegurarCapacidadCeldas(parqueadero),
    ).rejects.toThrow(NotFoundException);
  });

  // ✅ TEST 4: findParqueaderoById exitoso
  it('debería retornar parqueadero por id', async () => {
    const parqueadero = { id: 1, capacidadTotal: 0 };

    parqueaderoRepository.findOne.mockResolvedValue(parqueadero);

    const result = await service.findParqueaderoById(1);

    expect(result).toEqual(parqueadero);
  });

  // ❌ TEST 5: findParqueaderoById no existe
  it('debería lanzar error si no existe parqueadero', async () => {
    parqueaderoRepository.findOne.mockResolvedValue(null);

    await expect(service.findParqueaderoById(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  // ✅ TEST 6: findAllConDisponibilidad
  it('debería retornar parqueaderos con celdas disponibles', async () => {
    const parqueaderos = [
      { id: 1, capacidadTotal: 0, empresa: {} },
    ];

    parqueaderoRepository.find.mockResolvedValue(parqueaderos);
    celdaRepository.count.mockResolvedValue(5);

    const result = await service.findAllConDisponibilidad();

    expect(result[0]).toHaveProperty('celdasDisponibles', 5);
  });
});