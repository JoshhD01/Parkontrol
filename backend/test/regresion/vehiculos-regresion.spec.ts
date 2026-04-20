import { ConflictException, NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/vehiculos/vehiculos.service.module';

describe('VehiculosService Regression Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear - Regression', () => {
    it('should create vehiculo successfully', async () => {
      const { service, vehiculoRepository, tipoVehiculoRepository } = await createTestingModule();

      const dto = { placa: 'ABC123', idTipoVehiculo: 1 };
      const tipoVehiculo = { id: 1 };
      const vehiculo = { id: 1, placa: 'ABC123', tipoVehiculo };

      vehiculoRepository.findOne.resolves(null);
      tipoVehiculoRepository.findOne.resolves(tipoVehiculo);
      vehiculoRepository.create.returns(vehiculo);
      vehiculoRepository.save.resolves(vehiculo);

      const result = await service.crear(dto as any);

      expect(result).toEqual(vehiculo);
    });

    it('should throw ConflictException if placa exists', async () => {
      const { service, vehiculoRepository } = await createTestingModule();

      const dto = { placa: 'ABC123', idTipoVehiculo: 1 };
      vehiculoRepository.findOne.resolves({ id: 1 });

      await expect(service.crear(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByPlaca - Regression', () => {
    it('should return vehiculo by placa', async () => {
      const { service, vehiculoRepository } = await createTestingModule();

      const vehiculo = { id: 1, placa: 'ABC123' };
      vehiculoRepository.findOne.resolves(vehiculo);

      const result = await service.findByPlaca('abc123');

      expect(result).toEqual(vehiculo);
    });
  });

  describe('findVehiculoById - Regression', () => {
    it('should return vehiculo if found', async () => {
      const { service, vehiculoRepository } = await createTestingModule();

      const vehiculo = { id: 1 };
      vehiculoRepository.findOne.resolves(vehiculo);

      const result = await service.findVehiculoById(1);

      expect(result).toEqual(vehiculo);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, vehiculoRepository } = await createTestingModule();

      vehiculoRepository.findOne.resolves(null);

      await expect(service.findVehiculoById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findReservasByVehiculo - Regression', () => {
    it('should return reservas for vehiculo', async () => {
      const { service, reservaRepository } = await createTestingModule();

      service.findVehiculoById = jest.fn().mockResolvedValue({ id: 1 });
      const reservas = [{ id: 1 }];
      reservaRepository.find.resolves(reservas);

      const result = await service.findReservasByVehiculo(1);

      expect(result).toEqual(reservas);
    });
  });

  describe('findAllTiposVehiculo - Regression', () => {
    it('should return all tipos vehiculo', async () => {
      const { service, tipoVehiculoRepository } = await createTestingModule();

      const tipos = [{ id: 1 }];
      tipoVehiculoRepository.find.resolves(tipos);

      const result = await service.findAllTiposVehiculo();

      expect(result).toEqual(tipos);
    });
  });
});