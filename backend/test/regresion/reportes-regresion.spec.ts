import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/reportes/reportes.service.module';

describe('ReportesService Regression Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear - Regression', () => {
    it('should create reporte successfully', async () => {
      const { service, reporteRepository, periodoRepository, parqueaderosService } = await createTestingModule();

      const dto = { idParqueadero: 1, idPeriodo: 1, urlArchivo: 'test.pdf' };
      const parqueadero = { id: 1 };
      const periodo = { id: 1 };
      const reporte = { id: 1, parqueadero, periodo, urlArchivo: 'test.pdf' };

      parqueaderosService.findParqueaderoById.resolves(parqueadero);
      periodoRepository.findOne.resolves(periodo);
      reporteRepository.create.returns(reporte);
      reporteRepository.save.resolves(reporte);

      const result = await service.crear(dto as any);

      expect(result).toEqual(reporte);
    });

    it('should throw NotFoundException if periodo not found', async () => {
      const { service, parqueaderosService, periodoRepository } = await createTestingModule();

      const dto = { idParqueadero: 1, idPeriodo: 999, urlArchivo: 'test.pdf' };
      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      periodoRepository.findOne.resolves(null);

      await expect(service.crear(dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParqueadero - Regression', () => {
    it('should return reportes for parqueadero', async () => {
      const { service, reporteRepository } = await createTestingModule();

      const reportes = [{ id: 1 }];
      reporteRepository.find.resolves(reportes);

      const result = await service.findByParqueadero(1);

      expect(result).toEqual(reportes);
    });
  });

  describe('findReporteById - Regression', () => {
    it('should return reporte if found', async () => {
      const { service, reporteRepository } = await createTestingModule();

      const reporte = { id: 1 };
      reporteRepository.findOne.resolves(reporte);

      const result = await service.findReporteById(1);

      expect(result).toEqual(reporte);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, reporteRepository } = await createTestingModule();

      reporteRepository.findOne.resolves(null);

      await expect(service.findReporteById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizarUrl - Regression', () => {
    it('should update reporte url', async () => {
      const { service, reporteRepository } = await createTestingModule();

      const reporte = { id: 1, urlArchivo: 'old.pdf' };
      service.findReporteById = jest.fn().mockResolvedValue(reporte);
      reporteRepository.save.resolves({ ...reporte, urlArchivo: 'new.pdf' });

      const result = await service.actualizarUrl(1, 'new.pdf');

      expect(result.urlArchivo).toBe('new.pdf');
    });
  });
});