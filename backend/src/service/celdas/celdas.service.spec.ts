import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CeldasService } from './celdas.service';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { TipoCelda } from 'src/entities/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/entities/shared/entities/sensor.entity';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';

describe('CeldasService', () => {
  let service: CeldasService;

  let celdaRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };

  let tipoCeldaRepository: {
    findOne: jest.Mock;
  };

  let sensorRepository: {
    findOne: jest.Mock;
  };

  let parqueaderosService: {
    findParqueaderoById: jest.Mock;
  };

  beforeEach(async () => {
    celdaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    tipoCeldaRepository = {
      findOne: jest.fn(),
    };

    sensorRepository = {
      findOne: jest.fn(),
    };

    parqueaderosService = {
      findParqueaderoById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CeldasService,
        { provide: getRepositoryToken(Celda), useValue: celdaRepository },
        { provide: getRepositoryToken(TipoCelda), useValue: tipoCeldaRepository },
        { provide: getRepositoryToken(Sensor), useValue: sensorRepository },
        { provide: ParqueaderosService, useValue: parqueaderosService },
      ],
    }).compile();

    service = module.get<CeldasService>(CeldasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const parqueaderoMock = { id: 1 };
  const tipoCeldaMock = { id: 1 };
  const sensorMock = { id: 1 };
  const celdaMock = { id: 1 };

  describe('crear', () => {

    it('CS0001 - tipoCelda no existe', async () => {

      // Arrange
      const dto = {
        idParqueadero: 1,
        idTipoCelda: 1,
        idSensor: 1,
        estado: 'LIBRE',
      };

      parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
      tipoCeldaRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).rejects.toThrow(
        `No existe tipo de celda con id: ${dto.idTipoCelda}`,
      );
    });

    it('CS0002 - tipoCelda existe', async () => {

      // Arrange
      const dto = {
        idParqueadero: 1,
        idTipoCelda: 1,
        idSensor: 1,
        estado: 'LIBRE',
      };

      parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
      tipoCeldaRepository.findOne.mockResolvedValue(tipoCeldaMock);
      sensorRepository.findOne.mockResolvedValue(sensorMock);

      celdaRepository.create.mockReturnValue(celdaMock);
      celdaRepository.save.mockResolvedValue(celdaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(result).toBeDefined();
    });

    it('CS0003 - sensor no existe', async () => {

      // Arrange
      const dto = {
        idParqueadero: 1,
        idTipoCelda: 1,
        idSensor: 1,
        estado: 'LIBRE',
      };

      parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
      tipoCeldaRepository.findOne.mockResolvedValue(tipoCeldaMock);
      sensorRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).rejects.toThrow(
        `No existe sensor con id: ${dto.idSensor}`,
      );
    });

    it('CS0004 - sensor existe', async () => {

      // Arrange
      const dto = {
        idParqueadero: 1,
        idTipoCelda: 1,
        idSensor: 1,
        estado: 'LIBRE',
      };

      parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
      tipoCeldaRepository.findOne.mockResolvedValue(tipoCeldaMock);
      sensorRepository.findOne.mockResolvedValue(sensorMock);

      celdaRepository.create.mockReturnValue(celdaMock);
      celdaRepository.save.mockResolvedValue(celdaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(celdaRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

  });

  describe('findByParqueadero', () => {

    it('CS0001 - retorna lista de celdas', async () => {

      // Arrange
      celdaRepository.find.mockResolvedValue([celdaMock]);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(result).toHaveLength(1);
      expect(celdaRepository.find).toHaveBeenCalled();
    });

  });

  describe('findCeldaById', () => {

    it('CS0001 - celda no existe', async () => {

      // Arrange
      celdaRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.findCeldaById(1);

      // Assert
      await expect(action).rejects.toThrow(
        'No existe celda con id: 1',
      );
    });

    it('CS0002 - celda existe', async () => {

      // Arrange
      celdaRepository.findOne.mockResolvedValue(celdaMock);

      // Act
      const result = await service.findCeldaById(1);

      // Assert
      expect(result).toBeDefined();
    });

  });

  describe('actualizarEstado', () => {

    it('CS0001 - actualiza estado correctamente', async () => {

      // Arrange
      const celda = { id: 1, estado: 'LIBRE' };

      jest.spyOn(service, 'findCeldaById').mockResolvedValue(celda as any);

      celdaRepository.save.mockResolvedValue({
        ...celda,
        estado: 'OCUPADA',
      });

      // Act
      const result = await service.actualizarEstado(1, 'OCUPADA');

      // Assert
      expect(result.estado).toBe('OCUPADA');
      expect(celdaRepository.save).toHaveBeenCalled();
    });

  });

});