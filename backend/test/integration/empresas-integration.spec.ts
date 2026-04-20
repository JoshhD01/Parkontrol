import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/empresas/empresas.service.module';

describe('EmpresasService Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('should create empresa successfully', async () => {
      const { service, empresaRepository } = await createTestingModule();

      const dto = { nombre: 'Empresa Test', nit: '123456789' };
      const empresa = { id: 1, ...dto };
      empresaRepository.create.returns(empresa);
      empresaRepository.save.resolves(empresa);

      const result = await service.crear(dto as any);

      expect(result.id).toBe(1);
    });
  });

  describe('findEmpresaById', () => {
    it('should return empresa if found', async () => {
      const { service, empresaRepository } = await createTestingModule();

      const empresa = { id: 1, nombre: 'Test' };
      empresaRepository.findOneBy.resolves(empresa);

      const result = await service.findEmpresaById(1);

      expect(result).toEqual(empresa);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, empresaRepository } = await createTestingModule();

      empresaRepository.findOneBy.resolves(null);

      await expect(service.findEmpresaById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all empresas', async () => {
      const { service, empresaRepository } = await createTestingModule();

      const empresas = [{ id: 1 }, { id: 2 }];
      empresaRepository.find.resolves(empresas);

      const result = await service.findAll();

      expect(result.length).toBe(2);
    });
  });

  describe('obtenerDetalle', () => {
    it('should return empresa detail', async () => {
      const { service } = await createTestingModule();

      service.findEmpresaById = jest.fn().mockResolvedValue({ id: 1, nombre: 'Test' });

      const result = await service.obtenerDetalle(1);

      expect(result.id).toBe(1);
    });
  });

  describe('obtenerTodas', () => {
    it('should return all empresas', async () => {
      const { service } = await createTestingModule();

      service.findAll = jest.fn().mockResolvedValue([{ id: 1 }]);

      const result = await service.obtenerTodas();

      expect(result.length).toBe(1);
    });
  });
});