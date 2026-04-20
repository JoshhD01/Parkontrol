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
  const reservaCerradaMock = { id: 1, estado: 'CERRADA', celda: { id: 1 } };

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
    const dtoBase = {
      idVehiculo: 1,
      idCelda: 1,
      idClienteFactura: 1,
      horaInicio: new Date(),
      horaFin: new Date(Date.now() + 10000),
    };

    it('RS-CREAR-001 - debería crear reserva cuando clienteFactura existe', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      clienteFacturaRepository.findOne.resolves(clienteMock);
      reservaRepository.create.returns(reservaMock);
      reservaRepository.save.resolves(reservaMock);

      // Act
      const result = await service.crear(dtoBase as any);

      // Assert
      expect(result).to.equal(reservaMock);
      expect(clienteFacturaRepository.findOne.calledOnce).to.be.true;
    });

    it('RS-CREAR-002 - debería crear reserva cuando idClienteFactura es null', async () => {
      // Arrange
      const dtoSinCliente = { ...dtoBase, idClienteFactura: undefined };
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      reservaRepository.create.returns(reservaMock);
      reservaRepository.save.resolves(reservaMock);

      // Act
      const result = await service.crear(dtoSinCliente as any);

      // Assert
      expect(result).to.equal(reservaMock);
      expect(clienteFacturaRepository.findOne.called).to.be.false;
    });

    it('RS-CREAR-003 - debería lanzar NotFoundException cuando clienteFactura no existe', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      clienteFacturaRepository.findOne.resolves(null);

      // Act & Assert
      await expect(service.crear(dtoBase as any)).to.be.rejectedWith('No existe cliente con id: 1');
    });

    it('RS-CREAR-004 - debería lanzar BadRequestException cuando celda no está LIBRE', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaOcupadaMock);
      clienteFacturaRepository.findOne.resolves(clienteMock);

      // Act & Assert
      await expect(service.crear(dtoBase as any)).to.be.rejectedWith('La celda no está LIBRE');
    });

    it('RS-CREAR-005 - debería lanzar BadRequestException cuando horaInicio no es válido', async () => {
      // Arrange
      const dtoInvalidHoraInicio = { ...dtoBase, horaInicio: 'invalid' };
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      clienteFacturaRepository.findOne.resolves(clienteMock);

      // Act & Assert
      await expect(service.crear(dtoInvalidHoraInicio as any)).to.be.rejectedWith('horaInicio no tiene un formato válido');
    });

    it('RS-CREAR-006 - debería lanzar BadRequestException cuando horaFin no es válido', async () => {
      // Arrange
      const dtoInvalidHoraFin = { ...dtoBase, horaFin: 'invalid' };
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      clienteFacturaRepository.findOne.resolves(clienteMock);

      // Act & Assert
      await expect(service.crear(dtoInvalidHoraFin as any)).to.be.rejectedWith('horaFin no tiene un formato válido');
    });

    it('RS-CREAR-007 - debería lanzar BadRequestException cuando horaFin <= horaInicio', async () => {
      // Arrange
      const dtoInvalidHoras = { ...dtoBase, horaInicio: new Date(), horaFin: new Date() };
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      clienteFacturaRepository.findOne.resolves(clienteMock);

      // Act & Assert
      await expect(service.crear(dtoInvalidHoras as any)).to.be.rejectedWith('La hora fin debe ser mayor que la hora inicio');
    });
  });

  // ==========================================================================
  // crearParaCliente()
  // ==========================================================================
  describe('crearParaCliente', () => {
    const dtoBase = {
      placa: 'ABC123',
      idTipoVehiculo: 1,
      idParqueadero: 1,
      horaInicio: new Date(),
      horaFin: new Date(Date.now() + 10000),
    };

    it('RS-CREARCLIENTE-001 - debería crear reserva cuando vehiculo existe y tipo coincide', async () => {
      // Arrange
      vehiculosService.findByPlaca.resolves(vehiculoMock);
      celdasService.findByParqueadero.resolves([celdaLibreMock]);
      sandbox.restore();
      sandbox.stub(service, 'crear').resolves(reservaMock);

      // Act
      const result = await service.crearParaCliente(1, dtoBase);

      // Assert
      expect(result).to.equal(reservaMock);
      expect(vehiculosService.crear.called).to.be.false;
    });

    it('RS-CREARCLIENTE-002 - debería lanzar BadRequestException cuando vehiculo existe pero tipo diferente', async () => {
      // Arrange
      const vehiculoDiferenteTipo = { ...vehiculoMock, tipoVehiculo: { id: 2 } };
      vehiculosService.findByPlaca.resolves(vehiculoDiferenteTipo);

      // Act & Assert
      await expect(service.crearParaCliente(1, dtoBase)).to.be.rejectedWith('La placa ya existe con un tipo de vehículo diferente');
    });

    it('RS-CREARCLIENTE-003 - debería crear vehiculo cuando no existe', async () => {
      // Arrange
      vehiculosService.findByPlaca.resolves(null);
      vehiculosService.crear.resolves(vehiculoMock);
      celdasService.findByParqueadero.resolves([celdaLibreMock]);
      sandbox.restore();
      sandbox.stub(service, 'crear').resolves(reservaMock);

      // Act
      const result = await service.crearParaCliente(1, dtoBase);

      // Assert
      expect(result).to.equal(reservaMock);
      expect(vehiculosService.crear.calledOnce).to.be.true;
    });

    it('RS-CREARCLIENTE-004 - debería lanzar BadRequestException cuando no hay celda libre', async () => {
      // Arrange
      vehiculosService.findByPlaca.resolves(vehiculoMock);
      celdasService.findByParqueadero.resolves([{ ...celdaLibreMock, estado: 'OCUPADA' }]);

      // Act & Assert
      await expect(service.crearParaCliente(1, dtoBase)).to.be.rejectedWith('No hay celdas disponibles para el tipo de vehículo seleccionado en este parqueadero');
    });
  });

  // ==========================================================================
  // finalizarReserva()
  // ==========================================================================
  describe('finalizarReserva', () => {
    it('RS-FINALIZAR-001 - debería finalizar reserva cuando estado es ABIERTA', async () => {
      // Arrange
      sandbox.restore();
      sandbox.stub(service, 'findReservaById').resolves(reservaMock);
      reservaRepository.save.resolves({ ...reservaMock, estado: 'CERRADA' });
      reservaRepository.count.resolves(0);

      // Act
      const result = await service.finalizarReserva(1);

      // Assert
      expect(result.estado).to.equal('CERRADA');
      expect(celdasService.actualizarEstado.calledWith(1, 'LIBRE')).to.be.true;
    });

    it('RS-FINALIZAR-002 - debería lanzar BadRequestException cuando reserva ya está CERRADA', async () => {
      // Arrange
      sandbox.restore();
      sandbox.stub(service, 'findReservaById').resolves(reservaCerradaMock);

      // Act & Assert
      await expect(service.finalizarReserva(1)).to.be.rejectedWith('La reserva ya ha sido cerrada');
    });

    it('RS-FINALIZAR-003 - debería no liberar celda cuando hay reservas activas en la misma celda', async () => {
      // Arrange
      sandbox.restore();
      sandbox.stub(service, 'findReservaById').resolves(reservaMock);
      reservaRepository.save.resolves({ ...reservaMock, estado: 'CERRADA' });
      reservaRepository.count.resolves(1);

      // Act
      const result = await service.finalizarReserva(1);

      // Assert
      expect(result.estado).to.equal('CERRADA');
      expect(celdasService.actualizarEstado.called).to.be.false;
    });
  });

  // ==========================================================================
  // findReservaById()
  // ==========================================================================
  describe('findReservaById', () => {
    it('RS-FINDID-001 - debería retornar reserva cuando existe', async () => {
      // Arrange
      reservaRepository.findOne.resolves(reservaMock);

      // Act
      const result = await service.findReservaById(1);

      // Assert
      expect(result).to.equal(reservaMock);
    });

    it('RS-FINDID-002 - debería lanzar NotFoundException cuando reserva no existe', async () => {
      // Arrange
      reservaRepository.findOne.resolves(null);

      // Act & Assert
      await expect(service.findReservaById(1)).to.be.rejectedWith('No existe reserva con id: 1');
    });
  });

  // ==========================================================================
  // validarReglasReservaActiva() - pruebas para método privado vía spy
  // ==========================================================================
  describe('validarReglasReservaActiva', () => {
    let validarStub: sinon.SinonStub;

    beforeEach(() => {
      validarStub = sandbox.stub<any, any>(service, 'validarReglasReservaActiva');
    });

    it('RS-VALIDAR-001 - debería llamar validarReglasReservaActiva en crear', async () => {
      // Arrange
      vehiculosService.findVehiculoById.resolves(vehiculoMock);
      celdasService.findCeldaById.resolves(celdaLibreMock);
      clienteFacturaRepository.findOne.resolves(clienteMock);
      reservaRepository.create.returns(reservaMock);
      reservaRepository.save.resolves(reservaMock);
      validarStub.resolves();

      // Act
      await service.crear({ idVehiculo: 1, idCelda: 1, horaInicio: new Date(), horaFin: new Date() } as any);

      // Assert
      expect(validarStub.calledOnce).to.be.true;
    });

    // Para cubrir los ifs internos, necesitaríamos exponer o mockear queries, pero como es privado, asumimos que se prueba vía integración
  });

  // ==========================================================================
  // sincronizarEstadosPorHorario() - pruebas básicas
  // ==========================================================================
  describe('sincronizarEstadosPorHorario', () => {
    it('RS-SYNC-001 - debería sincronizar estados sin errores', async () => {
      // Arrange
      const queryBuilderMock = {
        leftJoinAndSelect: sinon.stub().returnsThis(),
        where: sinon.stub().returnsThis(),
        andWhere: sinon.stub().returnsThis(),
        getMany: sinon.stub().resolves([]),
      };
      reservaRepository.createQueryBuilder.returns(queryBuilderMock);

      // Act
      await service.sincronizarEstadosPorHorario();

      // Assert
      expect(queryBuilderMock.getMany.called).to.be.true;
    });
  });
});