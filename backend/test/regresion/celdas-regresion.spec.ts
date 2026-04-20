import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/celdas/celdas.service.module';

describe('CeldasService Regression Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear - Regression', () => {
    it('should create celda with valid data', async () => {
      const { service, celdaRepository, tipoCeldaRepository, sensorRepository, parqueaderosService } = await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda: 1,
        idSensor: 1,
        estado: 'libre',
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves({ id: 1 });
      sensorRepository.findOne.resolves({ id: 1 });
      celdaRepository.create.returns({ estado: 'libre', parqueadero: { id: 1 }, tipoCelda: { id: 1 }, sensor: { id: 1 } });
      celdaRepository.save.resolves({ id: 1, estado: 'libre', parqueadero: { id: 1 }, tipoCelda: { id: 1 }, sensor: { id: 1 } });

      const result = await service.crear(dto as any);

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if tipoCelda not found', async () => {
      const { service, parqueaderosService, tipoCeldaRepository } = await createTestingModule();

      const dto = { idParqueadero: 1, idTipoCelda: 999, idSensor: 1, estado: 'libre' };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves(null);

      await expect(service.crear(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if sensor not found', async () => {
      const { service, parqueaderosService, tipoCeldaRepository, sensorRepository } = await createTestingModule();

      const dto = { idParqueadero: 1, idTipoCelda: 1, idSensor: 999, estado: 'libre' };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves({ id: 1 });
      sensorRepository.findOne.resolves(null);

      await expect(service.crear(dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParqueadero - Regression', () => {
    it('should return celdas for valid parqueadero', async () => {
      const { service, celdaRepository } = await createTestingModule();

      const celdas = [{ id: 1, estado: 'libre' }];
      celdaRepository.find.resolves(celdas);

      const result = await service.findByParqueadero(1);

      expect(result).toEqual(celdas);
    });

    it('should return empty array if no celdas', async () => {
      const { service, celdaRepository } = await createTestingModule();

      celdaRepository.find.resolves([]);

      const result = await service.findByParqueadero(1);

      expect(result).toEqual([]);
    });
  });

  describe('findCeldaById - Regression', () => {
    it('should return celda if exists', async () => {
      const { service, celdaRepository } = await createTestingModule();

      const celda = { id: 1, estado: 'libre' };
      celdaRepository.findOne.resolves(celda);

      const result = await service.findCeldaById(1);

      expect(result).toEqual(celda);
    });

    it('should throw NotFoundException if celda not found', async () => {
      const { service, celdaRepository } = await createTestingModule();

      celdaRepository.findOne.resolves(null);

      await expect(service.findCeldaById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizarEstado - Regression', () => {
    it('should update estado successfully', async () => {
      const { service, celdaRepository } = await createTestingModule();

      const celda = { id: 1, estado: 'libre' };
      service.findCeldaById = jest.fn().mockResolvedValue(celda);
      celdaRepository.save.resolves({ ...celda, estado: 'ocupado', ultimoCambioEstado: new Date() });

      const result = await service.actualizarEstado(1, 'ocupado');

      expect(result.estado).toBe('ocupado');
      expect(result.ultimoCambioEstado).toBeDefined();
    });

    it('should update to libre', async () => {
      const { service, celdaRepository } = await createTestingModule();

      const celda = { id: 1, estado: 'ocupado' };
      service.findCeldaById = jest.fn().mockResolvedValue(celda);
      celdaRepository.save.resolves({ ...celda, estado: 'libre', ultimoCambioEstado: new Date() });

      const result = await service.actualizarEstado(1, 'libre');

      expect(result.estado).toBe('libre');
    });
  });
});