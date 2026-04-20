import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/reservas/reservas.service.module';

describe('ReservasService Regression Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findReservaById - Regression', () => {
    it('should return reserva if found', async () => {
      const { service, reservaRepository } = await createTestingModule();

      const reserva = { id: 1 };
      reservaRepository.findOne.resolves(reserva);

      const result = await service.findReservaById(1);

      expect(result).toEqual(reserva);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, reservaRepository } = await createTestingModule();

      reservaRepository.findOne.resolves(null);

      await expect(service.findReservaById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParqueadero - Regression', () => {
    it('should return reservas for parqueadero', async () => {
      const { service, reservaRepository } = await createTestingModule();

      const reservas = [{ id: 1 }];
      reservaRepository.find.resolves(reservas);

      const result = await service.findByParqueadero(1);

      expect(result).toEqual(reservas);
    });
  });

  describe('findActivas - Regression', () => {
    it('should return active reservas', async () => {
      const { service, reservaRepository } = await createTestingModule();

      const reservas = [{ id: 1, estado: 'ACTIVA' }];
      reservaRepository.find.resolves(reservas);

      const result = await service.findActivas();

      expect(result).toEqual(reservas);
    });
  });

  describe('findByClienteFactura - Regression', () => {
    it('should return reservas for cliente', async () => {
      const { service, reservaRepository } = await createTestingModule();

      const reservas = [{ id: 1 }];
      reservaRepository.find.resolves(reservas);

      const result = await service.findByClienteFactura(1);

      expect(result).toEqual(reservas);
    });
  });

  describe('finalizarReserva - Regression', () => {
    it('should finalize reserva', async () => {
      const { service, reservaRepository, celdasService } = await createTestingModule();

      const reserva = { id: 1, estado: 'ACTIVA', celda: { id: 1 } };
      reservaRepository.findOne.resolves(reserva);
      reservaRepository.update.resolves();
      celdasService.actualizarEstado.resolves();

      const result = await service.finalizarReserva(1);

      expect(result.fechaSalida).toBeDefined();
    });
  });
});