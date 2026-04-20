import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createTestingModule } from './pagos.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('PagosService - crear', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('ESC00014 / CS00007 - debe crear un pago exitosamente', async () => {
      // Arrange
      const { service, pagoRepository, reservasService, metodoPagoRepository, tarifasService } =
        await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 1 };

      const reservaMock = {
        id: 1,
        estado: 'ABIERTA',
        fechaEntrada: new Date('2024-01-15T10:00:00'),
        fechaSalida: new Date('2024-01-15T14:30:00'),
        celda: { id: 1, parqueadero: { id: 1 } },
        vehiculo: { id: 1, tipoVehiculo: { id: 1 } },
      };

      const metodoPagoMock = { id: 1, nombre: 'Efectivo' };
      const tarifaMock = { id: 1, precioFraccionHora: 5000, precioHoraAdicional: 4000 };
      const pagoMock = { id: 1, monto: 21000 };

      reservasService.findReservaById.resolves(reservaMock);
      reservasService.finalizarReserva.resolves(reservaMock);
      pagoRepository.findOne.resolves(null);
      metodoPagoRepository.findOne.resolves(metodoPagoMock);
      tarifasService.findByParqueaderoYTipo.resolves(tarifaMock);
      pagoRepository.create.returns(pagoMock);
      pagoRepository.save.resolves(pagoMock);

      sandbox.stub(service as any, 'calcularHoras').returns(5);
      sandbox.stub(service as any, 'calcularMonto').returns(21000);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(result).to.exist;
      expect(result).to.have.property('monto', 21000);
      expect(pagoRepository.save.calledOnce).to.be.true;
    });

    it('ESC00015 / CS00008 - lanza BadRequestException si la reserva no está ABIERTA', async () => {
      // Arrange
      const { service, pagoRepository, reservasService } = await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 1 };

      reservasService.findReservaById.resolves({
        id: 1,
        estado: 'CERRADA',
        fechaSalida: new Date(),
        celda: { id: 1, parqueadero: { id: 1 } },
        vehiculo: { id: 1, tipoVehiculo: { id: 1 } },
      });

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException, 'La reserva debe estar en estado ABIERTA');
      expect(pagoRepository.save.called).to.be.false;
    });

    it('ESC00016 / CS00009 - lanza BadRequestException si la reserva no tiene fecha de salida', async () => {
      // Arrange
      const { service, pagoRepository, reservasService } = await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 1 };

      reservasService.findReservaById.resolves({
        id: 1,
        estado: 'ABIERTA',
        fechaSalida: null,
        celda: { id: 1, parqueadero: { id: 1 } },
        vehiculo: { id: 1, tipoVehiculo: { id: 1 } },
      });

      reservasService.finalizarReserva.resolves({ id: 1, fechaSalida: null });

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException, 'La reserva debe estar finalizada');
      expect(pagoRepository.save.called).to.be.false;
    });

    it('ESC00017 / CS00010 - lanza BadRequestException si ya existe un pago para la reserva', async () => {
      // Arrange
      const { service, pagoRepository, reservasService } = await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 1 };

      reservasService.findReservaById.resolves({
        id: 1,
        estado: 'ABIERTA',
        fechaSalida: new Date(),
        celda: { id: 1, parqueadero: { id: 1 } },
        vehiculo: { id: 1, tipoVehiculo: { id: 1 } },
      });

      reservasService.finalizarReserva.resolves({ id: 1, fechaSalida: new Date() });
      pagoRepository.findOne.resolves({ id: 1, reserva: { id: 1 } });

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(BadRequestException, 'Ya existe un pago registrado para esta reserva');
      expect(pagoRepository.save.called).to.be.false;
    });

    it('ESC00018 / CS00011 - lanza NotFoundException si el método de pago no existe', async () => {
      // Arrange
      const { service, pagoRepository, reservasService, metodoPagoRepository, tarifasService } =
        await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 999 };

      reservasService.findReservaById.resolves({
        id: 1,
        estado: 'ABIERTA',
        fechaSalida: new Date(),
        celda: { id: 1, parqueadero: { id: 1 } },
        vehiculo: { id: 1, tipoVehiculo: { id: 1 } },
      });

      reservasService.finalizarReserva.resolves({ id: 1, fechaSalida: new Date() });
      pagoRepository.findOne.resolves(null);
      tarifasService.findByParqueaderoYTipo.resolves({ id: 1 });
      metodoPagoRepository.findOne.resolves(null);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException, 'No existe método de pago con id: 999');
      expect(pagoRepository.save.called).to.be.false;
    });

    it('ESC00019 / CS00012 - lanza NotFoundException si no existe tarifa configurada', async () => {
      // Arrange
      const { service, pagoRepository, reservasService, tarifasService } =
        await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 1 };

      reservasService.findReservaById.resolves({
        id: 1,
        estado: 'ABIERTA',
        fechaSalida: new Date(),
        celda: { id: 1, parqueadero: { id: 1 } },
        vehiculo: { id: 1, tipoVehiculo: { id: 1 } },
      });

      reservasService.finalizarReserva.resolves({ id: 1, fechaSalida: new Date() });
      pagoRepository.findOne.resolves(null);
      tarifasService.findByParqueaderoYTipo.resolves(null);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException, 'No existe tarifa configurada');
      expect(pagoRepository.save.called).to.be.false;
    });

    it('ESC00020 / CS00013 - propaga error si falla la consulta de reserva', async () => {
      // Arrange
      const { service, pagoRepository, reservasService } = await createTestingModule();

      const dto = { idReserva: 1, idMetodoPago: 1 };

      reservasService.findReservaById.rejects(new Error('Error DB'));

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('Error DB');
      expect(pagoRepository.save.called).to.be.false;
    });

  });

});
