import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { ParqueaderosService } from './parqueaderos.service';
import { Parqueadero } from 'src/entities/parqueaderos/entities/parqueadero.entity';
import { EmpresasService } from 'src/service/empresas/empresas.service';
import { Empresa } from 'src/entities/empresas/entities/empresa.entity';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { TipoCelda } from 'src/entities/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/entities/shared/entities/sensor.entity';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('ParqueaderosService', () => {
  let service: ParqueaderosService;

  let celdaRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };

  let tipoCeldaRepo: {
    findOne: jest.Mock;
  };

  let sensorRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };

  let empresasService: {
    findEmpresaById: jest.Mock;
  };

  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    celdaRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    };

    tipoCeldaRepo = {
      findOne: jest.fn(),
    };

    sensorRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    empresasService = {
      findEmpresaById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParqueaderosService,
        {
          provide: getRepositoryToken(Parqueadero),
          useValue: repository,
        },
        {
          provide: getRepositoryToken(Celda),
          useValue: celdaRepo,
        },
        {
          provide: getRepositoryToken(TipoCelda),
          useValue: tipoCeldaRepo,
        },
        {
          provide: getRepositoryToken(Sensor),
          useValue: sensorRepo,
        },
        {
          provide: EmpresasService,
          useValue: empresasService,
        },
      ],
    }).compile();

    service = module.get<ParqueaderosService>(ParqueaderosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =====================================================
  // PRUEBAS DEL MÉTODO CREAR
  // =====================================================

describe('crear', () => {

  it('CS00001', async () => {

    // Arrange
    const dto = {
      idEmpresa: 1,
      nombre: 'Central',
      capacidadTotal: 100,
      ubicacion: 'Centro',
    };

    const empresaMock = {
      id: 1,
      nombre: 'Empresa Test',
    };

    const parqueaderoMock = {
      id: 10,
      nombre: dto.nombre,
      capacidadTotal: dto.capacidadTotal,
      ubicacion: dto.ubicacion,
      empresa: empresaMock,
    };

    empresasService.findEmpresaById.mockResolvedValue(empresaMock);

    repository.create!.mockReturnValue(parqueaderoMock);
    repository.save!.mockResolvedValue(parqueaderoMock);

    jest
      .spyOn(service as any, 'asegurarCapacidadCeldas')
      .mockResolvedValue(undefined);

    // Act
    const resultado = await service.crear(dto as any);

    // Assert
    expect(empresasService.findEmpresaById).toHaveBeenCalledWith(1);
    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(parqueaderoMock);

    expect(resultado).toBeDefined();
    expect(resultado).toHaveProperty('id');
  });


  it('CS00002', async () => {

    // Arrange
    const dto = {
      idEmpresa: 99,
      nombre: 'Central',
      capacidadTotal: 100,
      ubicacion: 'Centro',
    };

    empresasService.findEmpresaById.mockResolvedValue(null);

    // Act
    const action = service.crear(dto as any);

    // Assert
    await expect(action).rejects.toThrow();

    expect(empresasService.findEmpresaById).toHaveBeenCalledWith(99);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });


  it('CS00003', async () => {

    // Arrange
    const dto = {
      idEmpresa: 1,
      nombre: 'Central',
      capacidadTotal: 100,
      ubicacion: 'Centro',
    };

    const empresaMock = {
      id: 1,
      nombre: 'Empresa Test',
    };

    const parqueaderoMock = {
      id: 10,
      nombre: dto.nombre,
      capacidadTotal: dto.capacidadTotal,
      ubicacion: dto.ubicacion,
      empresa: empresaMock,
    };

    empresasService.findEmpresaById.mockResolvedValue(empresaMock);

    repository.create!.mockReturnValue(parqueaderoMock);
    repository.save!.mockResolvedValue(null);

    jest
      .spyOn(service as any, 'asegurarCapacidadCeldas')
      .mockResolvedValue(undefined);

    // Act
    const action = service.crear(dto as any);

    // Assert
    await expect(action).rejects.toThrow(
      'No se pudo guardar el parqueadero',
    );

    expect(empresasService.findEmpresaById).toHaveBeenCalledWith(1);
    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(parqueaderoMock);

    expect(service['asegurarCapacidadCeldas']).not.toHaveBeenCalled();
  });


  it('CS00004', async () => {

    // Arrange
    const dto = {
      idEmpresa: 1,
      nombre: 'Central',
      capacidadTotal: 100,
      ubicacion: 'Centro',
    };

    const empresaMock = {
      id: 1,
      nombre: 'Empresa Test',
    };

    const parqueaderoMock = {
      id: 10,
      nombre: dto.nombre,
      capacidadTotal: dto.capacidadTotal,
      ubicacion: dto.ubicacion,
      empresa: empresaMock,
    };

    empresasService.findEmpresaById.mockResolvedValue(empresaMock);

    repository.create!.mockReturnValue(parqueaderoMock);
    repository.save!.mockResolvedValue(parqueaderoMock);

    jest
      .spyOn(service as any, 'asegurarCapacidadCeldas')
      .mockRejectedValue(new Error('Error al asegurar celdas'));

    // Act
    const action = service.crear(dto as any);

    // Assert
    await expect(action).rejects.toThrow();

    expect(empresasService.findEmpresaById).toHaveBeenCalledWith(1);
    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(parqueaderoMock);

    expect(service['asegurarCapacidadCeldas']).toHaveBeenCalled();
  });

});


// =====================================================
// PRUEBAS DEL MÉTODO findAllConDisponibilidad
// =====================================================

describe('findAllConDisponibilidad', () => {

  it('CS0005 - retorna lista vacía si no hay parqueaderos', async () => {

    // Arrange
    repository.find!.mockResolvedValue([]);

    // Act
    const resultado = await service.findAllConDisponibilidad();

    // Assert
    expect(repository.find).toHaveBeenCalled();
    expect(service['asegurarCapacidadCeldas']).not.toHaveBeenCalled();
    expect(celdaRepo.count).not.toHaveBeenCalled();

    expect(resultado).toEqual([]);
  });


  it('CS0006 - lanza error si falla la consulta a DB', async () => {

    // Arrange
    repository.find!.mockRejectedValue(new Error('DB error'));

    // Act
    const action = service.findAllConDisponibilidad();

    // Assert
    await expect(action).rejects.toThrow('DB error');

    expect(service['asegurarCapacidadCeldas']).not.toHaveBeenCalled();
  });


  it('CS0007 - falla dentro del for en count', async () => {

    // Arrange
    const empresaMock = { id: 1 };

    const parqueaderosMock = [
      { id: 1, empresa: empresaMock },
      { id: 2, empresa: empresaMock },
    ];

    repository.find!.mockResolvedValue(parqueaderosMock);

    jest
      .spyOn(service as any, 'asegurarCapacidadCeldas')
      .mockResolvedValue(undefined);

    celdaRepo.count!
      .mockResolvedValueOnce(10)
      .mockRejectedValueOnce(new Error('Error en count'));

    // Act
    const action = service.findAllConDisponibilidad();

    // Assert
    await expect(action).rejects.toThrow('Error en count');

    expect(celdaRepo.count).toHaveBeenCalledTimes(2);
  });


  it('CS0008 - falla asegurarCapacidadCeldas', async () => {

    // Arrange
    const empresaMock = { id: 1 };

    const parqueaderosMock = [{ id: 1, empresa: empresaMock }];

    repository.find!.mockResolvedValue(parqueaderosMock);

    jest
      .spyOn(service as any, 'asegurarCapacidadCeldas')
      .mockRejectedValue(new Error('Error capacidad'));

    // Act
    const action = service.findAllConDisponibilidad();

    // Assert
    await expect(action).rejects.toThrow('Error capacidad');

    expect(celdaRepo.count).not.toHaveBeenCalled();
  });


  it('CS0009 - retorna parqueaderos con disponibilidad cuando todo funciona bien', async () => {

    // Arrange
    const empresaMock = { id: 1, nombre: 'Empresa Test' };

    const parqueaderosMock = [
      {
        id: 1,
        nombre: 'Central',
        capacidadTotal: 100,
        ubicacion: 'Centro',
        empresa: empresaMock,
      },
      {
        id: 2,
        nombre: 'Norte',
        capacidadTotal: 50,
        ubicacion: 'Norte',
        empresa: empresaMock,
      },
    ];

    repository.find!.mockResolvedValue(parqueaderosMock);

    jest
      .spyOn(service as any, 'asegurarCapacidadCeldas')
      .mockResolvedValue(undefined);

    celdaRepo.count!
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(7);

    // Act
    const resultado = await service.findAllConDisponibilidad();

    // Assert
    expect(repository.find).toHaveBeenCalledWith({
      relations: ['empresa'],
    });

    expect(service['asegurarCapacidadCeldas']).toHaveBeenCalledTimes(2);
    expect(celdaRepo.count).toHaveBeenCalledTimes(2);

    expect(resultado).toHaveLength(2);

    expect(resultado[0]).toMatchObject({
      id: 1,
      nombre: 'Central',
      celdasDisponibles: 15,
    });

    expect(resultado[1]).toMatchObject({
      id: 2,
      nombre: 'Norte',
      celdasDisponibles: 7,
    });
  });

});

});