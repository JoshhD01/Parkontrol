import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/pagos/pagos.service.module';

describe('PagosService Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('should create pago successfully', async () => {
      const { service, pagoRepository, metodoPagoRepository, reservasService, tarifasService } = await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 1 };
      const reserva = { id: 1, estado: 'ABIERTA', celda: { parqueadero: { id: 1 } }, vehiculo: { tipoVehiculo: { id: 1 } }, fechaEntrada: new Date() };
      const reservaFinalizada = { ...reserva, fechaSalida: new Date() };
      const metodoPago = { id: 1 };
      const tarifa = { precioFraccionHora: 1000, precioHoraAdicional: 2000 };

      reservasService.findReservaById.resolves(reserva);
      reservasService.finalizarReserva.resolves(reservaFinalizada);
      pagoRepository.findOne.resolves(null);
      metodoPagoRepository.findOne.resolves(metodoPago);
      tarifasService.findByParqueaderoYTipo.resolves(tarifa);
      pagoRepository.create.returns({ reserva, metodoPago, monto: 1000, fechaPago: new Date() });
      pagoRepository.save.resolves({ id: 1, reserva, metodoPago, monto: 1000, fechaPago: new Date() });

      const result = await service.crear(dto as any);

      expect(result.id).toBe(1);
    });

    it('should throw BadRequestException if reserva not ABIERTA', async () => {
      const { service, reservasService } = await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 1 };
      const reserva = { estado: 'ACTIVA' };

      reservasService.findReservaById.resolves(reserva);

      await expect(service.crear(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByReserva', () => {
    it('should return pago for reserva', async () => {
      const { service, pagoRepository } = await createTestingModule();

      const pago = { id: 1 };
      pagoRepository.findOne.resolves(pago);

      const result = await service.findByReserva(1);

      expect(result).toEqual(pago);
    });
  });

  describe('findPagoById', () => {
    it('should return pago if found', async () => {
      const { service, pagoRepository } = await createTestingModule();

      const pago = { id: 1 };
      pagoRepository.findOne.resolves(pago);

      const result = await service.findPagoById(1);

      expect(result).toEqual(pago);
    });

    it('should throw NotFoundException if not found', async () => {
      const { service, pagoRepository } = await createTestingModule();

      pagoRepository.findOne.resolves(null);

      await expect(service.findPagoById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParqueadero', () => {
    it('should return pagos for parqueadero', async () => {
      const { service, pagoRepository } = await createTestingModule();

      const pagos = [{ id: 1 }];
      pagoRepository.find.resolves(pagos);

      const result = await service.findByParqueadero(1);

      expect(result).toEqual(pagos);
    });
  });

  describe('findByCliente', () => {
    it('should return pagos for cliente', async () => {
      const { service, pagoRepository } = await createTestingModule();

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      };
      pagoRepository.createQueryBuilder.returns(queryBuilder);

      const result = await service.findByCliente(1, 'test@test.com');

      expect(result).toEqual([{ id: 1 }]);
    });
  });
});