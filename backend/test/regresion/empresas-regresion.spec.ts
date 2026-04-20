import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/empresas/empresas.service.module';

describe('EmpresasService Regression Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear - Regression', () => {
    it('should create empresa with valid data', async () => {
      const { service, empresaRepository } = await createTestingModule();

      const dto = { nombre: 'Empresa Test', nit: '123456789' };
      const empresa = { id: 1, ...dto };
      empresaRepository.create.returns(empresa);
      empresaRepository.save.resolves(empresa);

      const result = await service.crear(dto as any);

      expect(result.id).toBe(1);
      expect(result.nombre).toBe('Empresa Test');
    });

    it('should create empresa with different data', async () => {
      const { service, empresaRepository } = await createTestingModule();

      const dto = { nombre: 'Otra Empresa', nit: '987654321' };
      const empresa = { id: 2, ...dto };
      empresaRepository.create.returns(empresa);
      empresaRepository.save.resolves(empresa);

      const result = await service.crear(dto as any);

      expect(result.id).toBe(2);
      expect(result.nit).toBe('987654321');
    });
  });

  describe('findEmpresaById - Regression', () => {
    it('should return empresa if exists', async () => {
      const { service, empresaRepository } = await createTestingModule();

      const empresa = { id: 1, nombre: 'Test' };
      empresaRepository.findOneBy.resolves(empresa);

      const result = await service.findEmpresaById(1);

      expect(result).toEqual(empresa);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, empresaRepository } = await createTestingModule();

      empresaRepository.findOneBy.resolves(null);

      await expect(service.findEmpresaById(999)).rejects.toThrow(NotFoundException);
    });

    it('should return different empresa for different id', async () => {
      const { service, empresaRepository } = await createTestingModule();

      const empresa = { id: 2, nombre: 'Empresa 2' };
      empresaRepository.findOneBy.resolves(empresa);

      const result = await service.findEmpresaById(2);

      expect(result.id).toBe(2);
    });
  });

  describe('findAll - Regression', () => {
    it('should return all empresas', async () => {
      const { service, empresaRepository } = await createTestingModule();

      const empresas = [{ id: 1 }, { id: 2 }];
      empresaRepository.find.resolves(empresas);

      const result = await service.findAll();

      expect(result.length).toBe(2);
    });

    it('should return empty array if no empresas', async () => {
      const { service, empresaRepository } = await createTestingModule();

      empresaRepository.find.resolves([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('obtenerDetalle - Regression', () => {
    it('should return empresa detail', async () => {
      const { service } = await createTestingModule();

      service.findEmpresaById = jest.fn().mockResolvedValue({ id: 1, nombre: 'Test' });

      const result = await service.obtenerDetalle(1);

      expect(result.id).toBe(1);
    });
  });

  describe('obtenerTodas - Regression', () => {
    it('should return all empresas via obtenerTodas', async () => {
      const { service } = await createTestingModule();

      service.findAll = jest.fn().mockResolvedValue([{ id: 1 }]);

      const result = await service.obtenerTodas();

      expect(result.length).toBe(1);
    });
  });
});