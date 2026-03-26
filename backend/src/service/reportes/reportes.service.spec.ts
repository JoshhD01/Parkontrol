import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ReportesService } from './reportes.service';
import { Reporte } from 'src/entities/reportes/entities/reporte.entity';
import { Periodo } from 'src/entities/shared/entities/periodo.entity';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';

describe('ReportesService', () => {
  let service: ReportesService;

  let reporteRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };

  let periodoRepository: {
    findOne: jest.Mock;
  };

  let parqueaderosService: {
    findParqueaderoById: jest.Mock;
  };

  beforeEach(async () => {
    reporteRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    periodoRepository = {
      findOne: jest.fn(),
    };

    parqueaderosService = {
      findParqueaderoById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: getRepositoryToken(Reporte), useValue: reporteRepository },
        { provide: getRepositoryToken(Periodo), useValue: periodoRepository },
        { provide: ParqueaderosService, useValue: parqueaderosService },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const parqueaderoMock = { id: 1 };
  const periodoMock = { id: 1 };
  const reporteMock = { id: 1 };

  describe('crear', () => {

    it('CS0001 - periodo no existe', async () => {

      // Arrange
      const dto = {
        idParqueadero: 1,
        idPeriodo: 1,
        urlArchivo: 'url',
      };

      parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
      periodoRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).rejects.toThrow(
        `No existe periodo con id: ${dto.idPeriodo}`,
      );
    });

    it('CS0002 - periodo existe', async () => {

      // Arrange
      const dto = {
        idParqueadero: 1,
        idPeriodo: 1,
        urlArchivo: 'url',
      };

      parqueaderosService.findParqueaderoById.mockResolvedValue(parqueaderoMock);
      periodoRepository.findOne.mockResolvedValue(periodoMock);

      reporteRepository.create.mockReturnValue(reporteMock);
      reporteRepository.save.mockResolvedValue(reporteMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(reporteRepository.create).toHaveBeenCalled();
      expect(reporteRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

  });

  describe('findByParqueadero', () => {

    it('CS0001 - retorna lista de reportes', async () => {

      // Arrange
      reporteRepository.find.mockResolvedValue([reporteMock]);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(result).toHaveLength(1);
      expect(reporteRepository.find).toHaveBeenCalled();
    });

    it('CS0002 - retorna lista vacía', async () => {

      // Arrange
      reporteRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(result).toHaveLength(0);
    });

  });

  describe('findReporteById', () => {

    it('CS0001 - reporte no existe', async () => {

      // Arrange
      reporteRepository.findOne.mockResolvedValue(null);

      // Act
      const action = service.findReporteById(1);

      // Assert
      await expect(action).rejects.toThrow(
        'No existe reporte con id: 1',
      );
    });

    it('CS0002 - reporte existe', async () => {

      // Arrange
      reporteRepository.findOne.mockResolvedValue(reporteMock);

      // Act
      const result = await service.findReporteById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

  });

  describe('actualizarUrl', () => {

    it('CS0001 - actualiza url correctamente', async () => {

      // Arrange
      const reporte = { id: 1, urlArchivo: 'old' };

      jest.spyOn(service, 'findReporteById').mockResolvedValue(reporte as any);

      reporteRepository.save.mockResolvedValue({
        ...reporte,
        urlArchivo: 'new',
      });

      // Act
      const result = await service.actualizarUrl(1, 'new');

      // Assert
      expect(reporteRepository.save).toHaveBeenCalled();
      expect(result.urlArchivo).toBe('new');
    });

    it('CS0002 - reporte no existe (propaga error)', async () => {

      // Arrange
      jest
        .spyOn(service, 'findReporteById')
        .mockRejectedValue(new Error('No existe reporte con id: 1'));

      // Act
      const action = service.actualizarUrl(1, 'new');

      // Assert
      await expect(action).rejects.toThrow();
    });

  });

});