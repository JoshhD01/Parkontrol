import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/tarifas/tarifas.service.module';

describe('TarifasService Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('should create tarifa successfully', async () => {
      const { service, tarifaRepository, tipoVehiculoRepository, parqueaderosService } = await createTestingModule();

      const dto = { idParqueadero: 1, idTipoVehiculo: 1, precioFraccionHora: 1000, precioHoraAdicional: 2000 };
      const parqueadero = { id: 1 };
      const tipoVehiculo = { id: 1 };
      const tarifa = { id: 1, parqueadero, tipoVehiculo, precioFraccionHora: 1000, precioHoraAdicional: 2000 };

      parqueaderosService.findParqueaderoById.resolves(parqueadero);
      tipoVehiculoRepository.findOne.resolves(tipoVehiculo);
      tarifaRepository.create.returns(tarifa);
      tarifaRepository.save.resolves(tarifa);

      const result = await service.crear(dto as any);

      expect(result).toEqual(tarifa);
    });

    it('should throw NotFoundException if tipoVehiculo not found', async () => {
      const { service, parqueaderosService, tipoVehiculoRepository } = await createTestingModule();

      const dto = { idParqueadero: 1, idTipoVehiculo: 1, precioFraccionHora: 1000 };
      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves(null);

      await expect(service.crear(dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParqueadero', () => {
    it('should return tarifas for parqueadero', async () => {
      const { service, tarifaRepository, parqueaderosService } = await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      const tarifas = [{ id: 1 }];
      tarifaRepository.find.resolves(tarifas);

      const result = await service.findByParqueadero(1);

      expect(result).toEqual(tarifas);
    });

    it('should throw BadRequestException for invalid id', async () => {
      const { service } = await createTestingModule();

      await expect(service.findByParqueadero(0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByParqueaderoYTipo', () => {
    it('should return tarifa for parqueadero and tipo', async () => {
      const { service, tarifaRepository, parqueaderosService, tipoVehiculoRepository } = await createTestingModule();

      parqueaderosService.findParqueaderoById.resolves({ id: 1 });
      tipoVehiculoRepository.findOne.resolves({ id: 1 });
      const tarifa = { id: 1 };
      tarifaRepository.findOne.resolves(tarifa);

      const result = await service.findByParqueaderoYTipo(1, 1);

      expect(result).toEqual(tarifa);
    });
  });

  describe('actualizar', () => {
    it('should update tarifa', async () => {
      const { service, tarifaRepository } = await createTestingModule();

      const tarifa = { id: 1, precioFraccionHora: 1000 };
      tarifaRepository.findOne.resolves(tarifa);
      tarifaRepository.save.resolves();
      const updated = { ...tarifa, precioFraccionHora: 1500 };
      tarifaRepository.findOne.resolves(updated);

      const result = await service.actualizar(1, { precioFraccionHora: 1500 } as any);

      expect(result.precioFraccionHora).toBe(1500);
    });
  });

  describe('findTarifaById', () => {
    it('should return tarifa if found', async () => {
      const { service, tarifaRepository } = await createTestingModule();

      const tarifa = { id: 1 };
      tarifaRepository.findOne.resolves(tarifa);

      const result = await service.findTarifaById(1);

      expect(result).toEqual(tarifa);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, tarifaRepository } = await createTestingModule();

      tarifaRepository.findOne.resolves(null);

      await expect(service.findTarifaById(1)).rejects.toThrow(NotFoundException);
    });
  });
});