import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);

const expect = chai.expect as any;

import { ReservasService } from 'src/service/reservas/reservas.service';
import { Reserva } from 'src/entities/reservas/entities/reserva.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { VehiculosService } from 'src/service/vehiculos/vehiculos.service';
import { CeldasService } from 'src/service/celdas/celdas.service';


// ─── Helper ──────────────────────────────────────────────────────────────────
// FIRST → Isolated: genera stubs frescos por cada test, sin estado compartido
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('ReservasService', () => {

  let service: ReservasService;
  let reservaRepository: Record<string, any>;
  let clienteFacturaRepository: Record<string, any>;
  let vehiculosService: Record<string, any>;
  let celdasService: Record<string, any>;

  // Sandbox de sinon — restaura todos los stubs/spies al hacer restore()
  const sandbox = sinon.createSandbox();

  // ── Fixtures ─────────────────────────────────────────────────────────────
  const vehiculoMock     = { id: 1, placa: 'ABC123', tipoVehiculo: { id: 1 } };
  const celdaLibreMock   = { id: 1, estado: 'LIBRE', tipoCelda: { id: 1 } };
  const celdaOcupadaMock = { id: 1, estado: 'OCUPADA' };
  const clienteMock      = { id: 1, correo: 'test@mail.com' };
  const reservaMock      = { id: 1, estado: 'ABIERTA', celda: { id: 1 } };

  // ── Setup ─────────────────────────────────────────────────────────────────
  // FIRST → Fast + Isolated: módulo recompilado con stubs frescos en cada test
  beforeEach(async () => {
    reservaRepository        = makeStub(['create', 'save', 'find', 'findOne', 'count', 'createQueryBuilder']);
    clienteFacturaRepository = makeStub(['findOne']);
    vehiculosService         = makeStub(['findVehiculoById', 'findByPlaca', 'crear']);
    celdasService            = makeStub(['findCeldaById', 'findByParqueadero', 'actualizarEstado']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: getRepositoryToken(Reserva),        useValue: reservaRepository },
        { provide: getRepositoryToken(ClienteFactura), useValue: clienteFacturaRepository },
        { provide: VehiculosService,                   useValue: vehiculosService },
        { provide: CeldasService,                      useValue: celdasService },
      ],
    }).compile();

    service = module.get<ReservasService>(ReservasService);

    // Métodos internos que no son objeto de prueba en esta suite
    sandbox.stub(service, 'sincronizarEstadosPorHorario').resolves(undefined);
    sandbox.stub<any, any>(service, 'validarReglasReservaActiva').resolves(undefined);
  });

  // ── Teardown ──────────────────────────────────────────────────────────────
  // FIRST → Isolated: restaura sandbox para evitar contaminación entre tests
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    // DTO base reutilizable — FIRST → Repeatable
    const dtoBase = {
      idVehiculo:       1,
      idCelda:          1,
      idClienteFactura: 1,
      horaInicio:       new Date(),
      horaFin:          new Date(Date.now() + 10000),
    };

    it('RS-CREAR-001 - lanza excepción cuando clienteFactura no existe', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      clienteFacturaRepository.findOne.resolves(null);

      // Act
      const action = service.crear(dtoBase as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        `No existe cliente con id: ${dtoBase.idClienteFactura}`,
      );
    });

    it('RS-CREAR-002 - lanza excepción cuando la celda no está libre', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaOcupadaMock);

      // Act
      const action = service.crear({ ...dtoBase, idClienteFactura: undefined } as any);

      // Assert
      await expect(action).to.be.rejectedWith('La celda no está LIBRE');
    });

    it('RS-CREAR-003 - lanza excepción cuando horaInicio tiene formato inválido', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);

      const dtoFechaInvalida = { ...dtoBase, horaInicio: 'fecha-mala' };

      // Act
      const action = service.crear(dtoFechaInvalida as any);

      // Assert
      await expect(action).to.be.rejectedWith('horaInicio no tiene un formato válido');
    });

    it('RS-CREAR-004 - lanza excepción cuando horaFin es menor a horaInicio', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);

      const dtoHoraInvalida = {
        ...dtoBase,
        horaInicio: new Date(),
        horaFin:    new Date(Date.now() - 1000),
      };

      // Act
      const action = service.crear(dtoHoraInvalida as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        'La hora fin debe ser mayor que la hora inicio',
      );
    });

    it('RS-CREAR-005 - crea y retorna la reserva cuando los datos son válidos', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      reservaRepository.create.returns(reservaMock);
      reservaRepository.save.resolves(reservaMock);

      // Act
      const result = await service.crear(dtoBase as any);

      // Assert
      expect(reservaRepository.create.calledOnce).to.be.true;
      expect(reservaRepository.save.calledOnce).to.be.true;
      expect(result)
        .to.exist
        .and.to.be.an('object');
    });

  });

  // ==========================================================================
  // crearParaCliente()
  // ==========================================================================
  describe('crearParaCliente', () => {

    it('RS-CPC-001 - lanza excepción cuando la placa existe con tipo de vehículo diferente', async () => {
      // Arrange
      vehiculosService.findByPlaca.resolves({
        ...vehiculoMock,
        tipoVehiculo: { id: 2 },
      });

      // Act
      const action = service.crearParaCliente(1, {
        placa:          'ABC',
        idTipoVehiculo: 1,
      } as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        'La placa ya existe con un tipo de vehículo diferente',
      );
    });

    it('RS-CPC-002 - lanza excepción cuando no hay celdas disponibles', async () => {
      // Arrange
      vehiculosService.findByPlaca.resolves(null);
      vehiculosService.crear.resolves(vehiculoMock);
      celdasService.findByParqueadero.resolves([]);

      // Act
      const action = service.crearParaCliente(1, {
        placa:          'ABC',
        idTipoVehiculo: 1,
        idParqueadero:  1,
      } as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        'No hay celdas disponibles para el tipo de vehículo seleccionado en este parqueadero',
      );
    });

  });

  // ==========================================================================
  // finalizarReserva()
  // ==========================================================================
  describe('finalizarReserva', () => {

    it('RS-FR-001 - lanza excepción cuando la reserva ya está cerrada', async () => {
      // Arrange
      sandbox.stub(service, 'findReservaById').resolves({
        ...reservaMock,
        estado: 'CERRADA',
      } as any);

      // Act
      const action = service.finalizarReserva(1);

      // Assert
      await expect(action).to.be.rejectedWith('La reserva ya ha sido cerrada');
    });

    it('RS-FR-002 - finaliza y retorna la reserva correctamente', async () => {
      // Arrange
      sandbox.stub(service, 'findReservaById').resolves(reservaMock as any);
      reservaRepository.save.resolves(reservaMock);
      reservaRepository.count.resolves(0);

      // Act
      const result = await service.finalizarReserva(1);

      // Assert
      expect(reservaRepository.save.called).to.be.true;
      expect(celdasService.actualizarEstado.called).to.be.true;
      expect(result)
        .to.exist
        .and.to.be.an('object');
    });

  });

  // ==========================================================================
  // findReservaById()
  // ==========================================================================
  describe('findReservaById', () => {

    it('RS-FRI-001 - lanza excepción cuando la reserva no existe', async () => {
      // Arrange
      reservaRepository.findOne.resolves(null);

      // Act
      const action = service.findReservaById(1);

      // Assert
      await expect(action).to.be.rejectedWith('No existe reserva con id: 1');
    });

    it('RS-FRI-002 - retorna la reserva cuando existe', async () => {
      // Arrange
      reservaRepository.findOne.resolves(reservaMock);

      // Act
      const result = await service.findReservaById(1);

      // Assert
      expect(result).to.exist;
    });

  });

  // ==========================================================================
  // findByParqueadero()
  // ==========================================================================
  describe('findByParqueadero', () => {

    it('RS-FBP-001 - retorna lista de reservas del parqueadero', async () => {
      // Arrange
      reservaRepository.find.resolves([reservaMock]);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);
    });

    it('RS-FBP-002 - retorna lista vacía cuando no hay reservas', async () => {
      // Arrange
      reservaRepository.find.resolves([]);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // findVehiculosByClienteFactura()
  // ==========================================================================
  describe('findVehiculosByClienteFactura', () => {

    it('RS-FVCF-001 - retorna vehículos únicos sin duplicados', async () => {
      // Arrange
      sandbox.stub(service, 'findByClienteFactura').resolves([
        { vehiculo: { id: 1 } },
        { vehiculo: { id: 1 } },
      ] as any);

      // Act
      const result = await service.findVehiculosByClienteFactura(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);
    });

  });

});