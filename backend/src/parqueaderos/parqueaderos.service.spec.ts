import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { ParqueaderosService } from './parqueaderos.service';
import { Parqueadero } from './entities/parqueadero.entity';
import { EmpresasService } from 'src/empresas/empresas.service';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { Celda } from 'src/celdas/entities/celda.entity';
import { TipoCelda } from 'src/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/shared/entities/sensor.entity';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  // =====================================================
  // PRUEBAS DEL MÉTODO CREAR - Lenin O
  // =====================================================

  describe('crear', () => {
    it('CS00001', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

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

      // -------------------------
      // ACT
      // -------------------------

      const resultado = await service.crear(dto as any);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(empresasService.findEmpresaById).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(parqueaderoMock);

      expect(resultado).toBeDefined();
      expect(resultado).toHaveProperty('id');
    });

    it('CS00002', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      const dto = {
        idEmpresa: 99,
        nombre: 'Central',
        capacidadTotal: 100,
        ubicacion: 'Centro',
      };

      empresasService.findEmpresaById.mockResolvedValue(null);

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.crear(dto as any)).rejects.toThrow();

      expect(empresasService.findEmpresaById).toHaveBeenCalledWith(99);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('CS00003', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

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

      // ACT + ASSERT
      await expect(service.crear(dto as any))
        .rejects
        .toThrow('No se pudo guardar el parqueadero');

      expect(empresasService.findEmpresaById).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(parqueaderoMock);

      // Opcional: validar que NO continúe el flujo
      expect(service['asegurarCapacidadCeldas']).not.toHaveBeenCalled();

    });
    
    it('CS00004', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

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

      // ACT + ASSERT
      await expect(service.crear(dto as any)).rejects.toThrow();

      expect(empresasService.findEmpresaById).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(parqueaderoMock);

      // Opcional: validar que NO continúe el flujo
      expect(service['asegurarCapacidadCeldas']).toHaveBeenCalled();

    });

  });

    // =====================================================
  // PRUEBAS DEL MÉTODO findAllConDisponibilidad - Lenin O
  // =====================================================


  describe('findAllConDisponibilidad', () => {

    it('CS0005 - retorna lista vacía si no hay parqueaderos', async () => {
      // ARRANGE
      repository.find!.mockResolvedValue([]);

      // ACT
      const resultado = await service.findAllConDisponibilidad();

      // ASSERT
      expect(repository.find).toHaveBeenCalled();
      expect(service['asegurarCapacidadCeldas']).not.toHaveBeenCalled();
      expect(celdaRepo.count).not.toHaveBeenCalled();
      expect(resultado).toEqual([]);
    });

    it('CS0006 - lanza error si falla la consulta a DB', async () => {
      // ARRANGE
      repository.find!.mockRejectedValue(new Error('DB error'));

      // ACT + ASSERT
      await expect(service.findAllConDisponibilidad())
        .rejects
        .toThrow('DB error');

      expect(service['asegurarCapacidadCeldas']).not.toHaveBeenCalled();
    });


    it('CS0007 - falla dentro del for en count', async () => {
      // ARRANGE
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

      // ACT + ASSERT
      await expect(service.findAllConDisponibilidad())
        .rejects
        .toThrow('Error en count');

      expect(celdaRepo.count).toHaveBeenCalledTimes(2);
    });

    it('CS0008 - falla asegurarCapacidadCeldas', async () => {
      // ARRANGE
      const empresaMock = { id: 1 };

      const parqueaderosMock = [
        { id: 1, empresa: empresaMock },
      ];

      repository.find!.mockResolvedValue(parqueaderosMock);

      jest
        .spyOn(service as any, 'asegurarCapacidadCeldas')
        .mockRejectedValue(new Error('Error capacidad'));

      // ACT + ASSERT
      await expect(service.findAllConDisponibilidad())
        .rejects
        .toThrow('Error capacidad');

      expect(celdaRepo.count).not.toHaveBeenCalled();
    });

    it('CS0009 - retorna parqueaderos con disponibilidad cuando todo funciona bien', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

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

      // -------------------------
      // ACT
      // -------------------------

      const resultado = await service.findAllConDisponibilidad();

      // -------------------------
      // ASSERT
      // -------------------------

      // Se consulta DB
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['empresa'],
      });

      // Se asegura capacidad por cada parqueadero
      expect(service['asegurarCapacidadCeldas']).toHaveBeenCalledTimes(2);

      // Se consulta disponibilidad por cada parqueadero
      expect(celdaRepo.count).toHaveBeenCalledTimes(2);

      // Resultado correcto
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

      // =====================================================
  // PRUEBAS DEL MÉTODO asegurarCapacidadCeldas - Lenin O
  // =====================================================


  describe('asegurarCapacidadCeldas', ()=>{
    it('CS00010 - termina si capacidad es 0', async () => {
      const parqueaderoMock = { id: 1, capacidadTotal: 0 };

      await expect(
        service['asegurarCapacidadCeldas'](parqueaderoMock as any),
      ).resolves.toBeUndefined();

      expect(celdaRepo.count).not.toHaveBeenCalled();
      expect(sensorRepo.save).not.toHaveBeenCalled();
    });

    it('CS00011 - termina si ya cumple capacidad', async () => {
      const parqueaderoMock = { id: 1, capacidadTotal: 5 };

      celdaRepo.count!.mockResolvedValue(6);

      await expect(
        service['asegurarCapacidadCeldas'](parqueaderoMock as any),
      ).resolves.toBeUndefined();

      expect(sensorRepo.save).not.toHaveBeenCalled();
    });

    it('CS00012 - falla si obtenerTipoCeldaDefault lanza error', async () => {
      const parqueaderoMock = { id: 1, capacidadTotal: 3 };

      celdaRepo.count!.mockResolvedValue(1);

      jest
        .spyOn(service as any, 'obtenerTipoCeldaDefault')
        .mockRejectedValue(new Error('No existe tipo default'));

      await expect(
        service['asegurarCapacidadCeldas'](parqueaderoMock as any),
      ).rejects.toThrow('No existe tipo default');

      expect(sensorRepo.save).not.toHaveBeenCalled();
    });

    it('CS00013 - falla si guardar sensores falla', async () => {
      const parqueaderoMock = { id: 1, capacidadTotal: 3 };

      celdaRepo.count!.mockResolvedValue(1);

      jest
        .spyOn(service as any, 'obtenerTipoCeldaDefault')
        .mockResolvedValue({ id: 99 });

      sensorRepo.create!.mockImplementation((d) => d);
      sensorRepo.save!.mockRejectedValue(new Error('Error sensores'));

      await expect(
        service['asegurarCapacidadCeldas'](parqueaderoMock as any),
      ).rejects.toThrow('Error sensores');
    });

    it('CS00014 - falla si guardar celdas falla', async () => {
      const parqueaderoMock = { id: 1, capacidadTotal: 3 };

      celdaRepo.count!.mockResolvedValue(1);

      jest
        .spyOn(service as any, 'obtenerTipoCeldaDefault')
        .mockResolvedValue({ id: 99 });

      sensorRepo.create!.mockImplementation((d) => d);
      sensorRepo.save!.mockResolvedValue([{ id: 10 }]);

      celdaRepo.create!.mockImplementation((d) => d);
      celdaRepo.save!.mockRejectedValue(new Error('Error celdas'));

      await expect(
        service['asegurarCapacidadCeldas'](parqueaderoMock as any),
      ).rejects.toThrow('Error celdas');
    });

    it('CS00026 - falla si create de celdas lanza error', async () => {
      const parqueaderoMock = { id: 1, capacidadTotal: 3 };

      celdaRepo.count!.mockResolvedValue(1);

      jest
        .spyOn(service as any, 'obtenerTipoCeldaDefault')
        .mockResolvedValue({ id: 99 });

      sensorRepo.create!.mockImplementation((d) => d);
      sensorRepo.save!.mockResolvedValue([{ id: 10 }]);

      celdaRepo.create!.mockImplementation(() => {
        throw new Error('Error creando celda');
      });

      await expect(
        service['asegurarCapacidadCeldas'](parqueaderoMock as any),
      ).rejects.toThrow('Error creando celda');
    });

    it('CS00027 - crea sensores y celdas correctamente', async () => {
      const parqueaderoMock = { id: 1, capacidadTotal: 3 };

      celdaRepo.count!.mockResolvedValue(1); // faltan 2

      jest
        .spyOn(service as any, 'obtenerTipoCeldaDefault')
        .mockResolvedValue({ id: 99 });

      sensorRepo.create!.mockImplementation((d) => d);

      sensorRepo.save!.mockResolvedValue([
        { id: 10 },
        { id: 11 },
      ]);

      celdaRepo.create!.mockImplementation((d) => d);
      celdaRepo.save!.mockResolvedValue([]);

      await expect(
        service['asegurarCapacidadCeldas'](parqueaderoMock as any),
      ).resolves.toBeUndefined();

      expect(sensorRepo.create).toHaveBeenCalledTimes(2);
      expect(celdaRepo.create).toHaveBeenCalledTimes(2);
      expect(celdaRepo.save).toHaveBeenCalledTimes(1);
    });

  });

});