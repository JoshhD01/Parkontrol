import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/celdas/celdas.service.module';

describe('CeldasService Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('should create a celda successfully', async () => {
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

      expect(result).toEqual({ id: 1, estado: 'libre', parqueadero: { id: 1 }, tipoCelda: { id: 1 }, sensor: { id: 1 } });
    });

    it('should throw NotFoundException if tipoCelda not found', async () => {
      const { service, parqueaderosService, tipoCeldaRepository } = await createTestingModule();

      const dto = {
        idParqueadero: 1,
        idTipoCelda: 1,
        idSensor: 1,
        estado: 'libre',
      };

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoCeldaRepository.findOne.resolves(null);

      await expect(service.crear(dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParqueadero', () => {
    it('should return celdas for parqueadero', async () => {
      const { service, celdaRepository } = await createTestingModule();

      const celdas = [{ id: 1, estado: 'libre' }];
      celdaRepository.find.resolves(celdas);

      const result = await service.findByParqueadero(1);

      expect(result).toEqual(celdas);
    });
  });

  describe('findCeldaById', () => {
    it('should return celda if found', async () => {
      const { service, celdaRepository } = await createTestingModule();

      const celda = { id: 1, estado: 'libre' };
      celdaRepository.findOne.resolves(celda);

      const result = await service.findCeldaById(1);

      expect(result).toEqual(celda);
    });

    it('should throw NotFoundException if celda not found', async () => {
      const { service, celdaRepository } = await createTestingModule();

      celdaRepository.findOne.resolves(null);

      await expect(service.findCeldaById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizarEstado', () => {
    it('should update celda estado', async () => {
      const { service, celdaRepository } = await createTestingModule();

      const celda = { id: 1, estado: 'libre' };
      service.findCeldaById = jest.fn().mockResolvedValue(celda);
      celdaRepository.save.resolves({ ...celda, estado: 'ocupado', ultimoCambioEstado: new Date() });

      const result = await service.actualizarEstado(1, 'ocupado');

      expect(result.estado).toBe('ocupado');
    });
  });
});