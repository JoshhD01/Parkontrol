import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/parqueaderos/parqueaderos.service.module';

describe('ParqueaderosService Regression Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear - Regression', () => {
    it('should create parqueadero successfully', async () => {
      const { service, parqueaderoRepository, empresasService } = await createTestingModule();

      const dto = { nombre: 'Parqueadero Test', capacidadTotal: 10, ubicacion: 'Test', idEmpresa: 1 };
      const empresa = { id: 1 };
      const parqueadero = { id: 1, ...dto, empresa };

      empresasService.findEmpresaById.resolves(empresa);
      parqueaderoRepository.create.returns(parqueadero);
      parqueaderoRepository.save.resolves(parqueadero);

      const result = await service.crear(dto as any);

      expect(result.id).toBe(1);
    });
  });

  describe('findParqueaderoById - Regression', () => {
    it('should return parqueadero if found', async () => {
      const { service, parqueaderoRepository } = await createTestingModule();

      const parqueadero = { id: 1, nombre: 'Test' };
      parqueaderoRepository.findOne.resolves(parqueadero);

      const result = await service.findParqueaderoById(1);

      expect(result).toEqual(parqueadero);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, parqueaderoRepository } = await createTestingModule();

      parqueaderoRepository.findOne.resolves(null);

      await expect(service.findParqueaderoById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll - Regression', () => {
    it('should return all parqueaderos', async () => {
      const { service, parqueaderoRepository } = await createTestingModule();

      const parqueaderos = [{ id: 1 }];
      parqueaderoRepository.find.resolves(parqueaderos);

      const result = await service.findAll();

      expect(result.length).toBe(1);
    });
  });

  describe('findAllConDisponibilidad - Regression', () => {
    it('should return parqueaderos with disponibilidad', async () => {
      const { service, parqueaderoRepository, celdaRepository } = await createTestingModule();

      const parqueaderos = [{ id: 1 }];
      parqueaderoRepository.find.resolves(parqueaderos);
      celdaRepository.count.resolves(5);

      const result = await service.findAllConDisponibilidad();

      expect(result[0].celdasDisponibles).toBe(5);
    });
  });

  describe('findByEmpresa - Regression', () => {
    it('should return parqueaderos for empresa', async () => {
      const { service, parqueaderoRepository } = await createTestingModule();

      const parqueaderos = [{ id: 1 }];
      parqueaderoRepository.find.resolves(parqueaderos);

      const result = await service.findByEmpresa(1);

      expect(result.length).toBe(1);
    });
  });

  describe('obtenerDetalle - Regression', () => {
    it('should return parqueadero detail', async () => {
      const { service } = await createTestingModule();

      service.findParqueaderoById = jest.fn().mockResolvedValue({ id: 1 });

      const result = await service.obtenerDetalle(1);

      expect(result.id).toBe(1);
    });
  });
});