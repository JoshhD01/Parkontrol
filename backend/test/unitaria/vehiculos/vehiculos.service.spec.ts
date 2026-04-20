import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);

const expect = chai.expect as any;

import { VehiculosService } from 'src/service/vehiculos/vehiculos.service';
import { Vehiculo } from 'src/entities/vehiculos/entities/vehiculo.entity';
import { TipoVehiculo } from 'src/entities/shared/entities/tipo-vehiculo.entity';
import { Reserva } from 'src/entities/reservas/entities/reserva.entity';


// ─── Helper ──────────────────────────────────────────────────────────────────
// FIRST → Isolated: genera stubs frescos por cada test, sin estado compartido
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('VehiculosService', () => {

  let service: VehiculosService;
  let vehiculoRepository: Record<string, any>;
  let tipoVehiculoRepository: Record<string, any>;
  let reservaRepository: Record<string, any>;

  // Sandbox de sinon — restaura todos los stubs/spies al hacer restore()
  const sandbox = sinon.createSandbox();

  // ── Fixtures ─────────────────────────────────────────────────────────────
  const vehiculoMock     = { id: 1, placa: 'ABC123' };
  const tipoVehiculoMock = { id: 1 };

  // ── Setup ─────────────────────────────────────────────────────────────────
  // FIRST → Fast + Isolated: módulo recompilado con stubs frescos en cada test
  beforeEach(async () => {
    vehiculoRepository     = makeStub(['findOne', 'create', 'save']);
    tipoVehiculoRepository = makeStub(['findOne', 'find']);
    reservaRepository      = makeStub(['find']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiculosService,
        { provide: getRepositoryToken(Vehiculo),     useValue: vehiculoRepository },
        { provide: getRepositoryToken(TipoVehiculo), useValue: tipoVehiculoRepository },
        { provide: getRepositoryToken(Reserva),      useValue: reservaRepository },
      ],
    }).compile();

    service = module.get<VehiculosService>(VehiculosService);
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
    const dtoBase = { placa: 'abc123', idTipoVehiculo: 1 };

    it('VS-CREAR-001 - lanza excepción cuando ya existe un vehículo con esa placa', async () => {
      // Arrange
      vehiculoRepository.findOne.resolves(vehiculoMock);

      // Act
      const action = service.crear(dtoBase as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        'Ya existe un vehículo con placa: abc123',
      );
    });

    it('VS-CREAR-002 - lanza excepción cuando el tipoVehiculo no existe', async () => {
      // Arrange
      vehiculoRepository.findOne.resolves(null);
      tipoVehiculoRepository.findOne.resolves(null);

      // Act
      const action = service.crear({ placa: 'abc123', idTipoVehiculo: 99 } as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        'No existe tipo de vehículo con id: 99',
      );
    });

    it('VS-CREAR-003 - crea y retorna el vehículo cuando los datos son válidos', async () => {
      // Arrange
      vehiculoRepository.findOne.resolves(null);
      tipoVehiculoRepository.findOne.resolves(tipoVehiculoMock);
      vehiculoRepository.create.returns(vehiculoMock);
      vehiculoRepository.save.resolves(vehiculoMock);

      // Act
      const result = await service.crear(dtoBase as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.be.an('object');

      expect(vehiculoRepository.save.calledOnce).to.be.true;
    });

    it('VS-CREAR-004 - normaliza la placa a mayúsculas antes de persistir', async () => {
      // Arrange
      vehiculoRepository.findOne.resolves(null);
      tipoVehiculoRepository.findOne.resolves(tipoVehiculoMock);
      vehiculoRepository.create.returns({ ...vehiculoMock, placa: 'ABC123' });
      vehiculoRepository.save.resolves(vehiculoMock);

      // Act
      const result = await service.crear(dtoBase as any);

      // Assert
      expect(
        vehiculoRepository.create.calledWithMatch({ placa: 'ABC123' }),
      ).to.be.true;

      expect(result).to.exist;
    });

  });

  // ==========================================================================
  // findByPlaca()
  // ==========================================================================
  describe('findByPlaca', () => {

    it('VS-FBP-001 - retorna el vehículo cuando la placa existe', async () => {
      // Arrange
      vehiculoRepository.findOne.resolves(vehiculoMock);

      // Act
      const result = await service.findByPlaca('abc123');

      // Assert
      expect(result).to.exist;
    });

    it('VS-FBP-002 - retorna null cuando la placa no existe', async () => {
      // Arrange
      vehiculoRepository.findOne.resolves(null);

      // Act
      const result = await service.findByPlaca('abc123');

      // Assert
      expect(result).to.be.null;
    });

  });

  // ==========================================================================
  // findVehiculoById()
  // ==========================================================================
  describe('findVehiculoById', () => {

    it('VS-FVI-001 - lanza excepción cuando el vehículo no existe', async () => {
      // Arrange
      vehiculoRepository.findOne.resolves(null);

      // Act
      const action = service.findVehiculoById(1);

      // Assert
      await expect(action).to.be.rejectedWith('No existe vehículo con id: 1');
    });

    it('VS-FVI-002 - retorna el vehículo cuando existe', async () => {
      // Arrange
      vehiculoRepository.findOne.resolves(vehiculoMock);

      // Act
      const result = await service.findVehiculoById(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

  });

  // ==========================================================================
  // findReservasByVehiculo()
  // ==========================================================================
  describe('findReservasByVehiculo', () => {

    it('VS-FRV-001 - lanza excepción cuando el vehículo no existe', async () => {
      // Arrange
      sandbox
        .stub(service, 'findVehiculoById')
        .rejects(new Error('No existe vehículo con id: 1'));

      // Act
      const action = service.findReservasByVehiculo(1);

      // Assert
      await expect(action).to.be.rejectedWith('No existe vehículo con id: 1');
    });

    it('VS-FRV-002 - retorna lista de reservas del vehículo', async () => {
      // Arrange
      sandbox.stub(service, 'findVehiculoById').resolves(vehiculoMock as any);
      reservaRepository.find.resolves([{ id: 1 }]);

      // Act
      const result = await service.findReservasByVehiculo(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);
    });

    it('VS-FRV-003 - retorna lista vacía cuando el vehículo no tiene reservas', async () => {
      // Arrange
      sandbox.stub(service, 'findVehiculoById').resolves(vehiculoMock as any);
      reservaRepository.find.resolves([]);

      // Act
      const result = await service.findReservasByVehiculo(1);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // findAllTiposVehiculo()
  // ==========================================================================
  describe('findAllTiposVehiculo', () => {

    it('VS-FATV-001 - retorna lista de tipos de vehículo', async () => {
      // Arrange
      tipoVehiculoRepository.find.resolves([tipoVehiculoMock]);

      // Act
      const result = await service.findAllTiposVehiculo();

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);
    });

    it('VS-FATV-002 - retorna lista vacía cuando no hay tipos registrados', async () => {
      // Arrange
      tipoVehiculoRepository.find.resolves([]);

      // Act
      const result = await service.findAllTiposVehiculo();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

});