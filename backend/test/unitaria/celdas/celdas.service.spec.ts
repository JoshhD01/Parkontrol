import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);

const expect = chai.expect as any;


import { CeldasService } from 'src/service/celdas/celdas.service';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { TipoCelda } from 'src/entities/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/entities/shared/entities/sensor.entity';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';


// ─── Helper ──────────────────────────────────────────────────────────────────
// FIRST → Isolated: genera stubs frescos por cada test, sin estado compartido
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('CeldasService', () => {

  let service: CeldasService;
  let celdaRepository: Record<string, any>;
  let tipoCeldaRepository: Record<string, any>;
  let sensorRepository: Record<string, any>;
  let parqueaderosService: Record<string, any>;

  // Sandbox de sinon — restaura todos los stubs/spies al hacer restore()
  const sandbox = sinon.createSandbox();

  // ── Fixtures ─────────────────────────────────────────────────────────────
  const parqueaderoMock = { id: 1 };
  const tipoCeldaMock   = { id: 1 };
  const sensorMock      = { id: 1 };
  const celdaMock       = { id: 1, estado: 'LIBRE' };

  // ── Setup ─────────────────────────────────────────────────────────────────
  // FIRST → Fast + Isolated: módulo recompilado con stubs frescos en cada test
  beforeEach(async () => {
    celdaRepository     = makeStub(['create', 'save', 'find', 'findOne']);
    tipoCeldaRepository = makeStub(['findOne']);
    sensorRepository    = makeStub(['findOne']);
    parqueaderosService = makeStub(['findParqueaderoById']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CeldasService,
        { provide: getRepositoryToken(Celda),     useValue: celdaRepository },
        { provide: getRepositoryToken(TipoCelda), useValue: tipoCeldaRepository },
        { provide: getRepositoryToken(Sensor),    useValue: sensorRepository },
        { provide: ParqueaderosService,           useValue: parqueaderosService },
      ],
    }).compile();

    service = module.get<CeldasService>(CeldasService);
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
      idParqueadero: 1,
      idTipoCelda:   1,
      idSensor:      1,
      estado:        'LIBRE',
    };

    it('CS-CREAR-001 - lanza excepción cuando tipoCelda no existe', async () => {
      // Arrange
      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      tipoCeldaRepository.findOne.resolves(null);

      // Act
      const action = service.crear(dtoBase as any);

      // Assert — FluentAssertions style
      await expect(action).to.be.rejectedWith(
        `No existe tipo de celda con id: ${dtoBase.idTipoCelda}`,
      );
    });

    it('CS-CREAR-002 - lanza excepción cuando sensor no existe', async () => {
      // Arrange
      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      tipoCeldaRepository.findOne.resolves(tipoCeldaMock);
      sensorRepository.findOne.resolves(null);

      // Act
      const action = service.crear(dtoBase as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        `No existe sensor con id: ${dtoBase.idSensor}`,
      );
    });

    it('CS-CREAR-003 - retorna la celda creada cuando todos los recursos existen', async () => {
      // Arrange
      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      tipoCeldaRepository.findOne.resolves(tipoCeldaMock);
      sensorRepository.findOne.resolves(sensorMock);
      celdaRepository.create.returns(celdaMock);
      celdaRepository.save.resolves(celdaMock);

      // Act
      const result = await service.crear(dtoBase as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.be.an('object')
        .and.to.have.property('id', 1);
    });

    it('CS-CREAR-004 - invoca save exactamente una vez al persistir la celda', async () => {
      // Arrange
      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      tipoCeldaRepository.findOne.resolves(tipoCeldaMock);
      sensorRepository.findOne.resolves(sensorMock);
      celdaRepository.create.returns(celdaMock);
      celdaRepository.save.resolves(celdaMock);

      // Act
      await service.crear(dtoBase as any);

      // Assert
      expect(celdaRepository.save.calledOnce).to.be.true;
    });

  });

  // ==========================================================================
  // findByParqueadero()
  // ==========================================================================
  describe('findByParqueadero', () => {

    it('CS-FBP-001 - retorna arreglo con las celdas del parqueadero', async () => {
      // Arrange
      celdaRepository.find.resolves([celdaMock]);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1)
        .and.to.deep.include(celdaMock);

      expect(celdaRepository.find.called).to.be.true;
    });

    it('CS-FBP-002 - retorna arreglo vacío cuando el parqueadero no tiene celdas', async () => {
      // Arrange
      celdaRepository.find.resolves([]);

      // Act
      const result = await service.findByParqueadero(99);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // findCeldaById()
  // ==========================================================================
  describe('findCeldaById', () => {

    it('CS-FCI-001 - lanza excepción cuando la celda no existe', async () => {
      // Arrange
      celdaRepository.findOne.resolves(null);

      // Act
      const action = service.findCeldaById(1);

      // Assert
      await expect(action).to.be.rejectedWith('No existe celda con id: 1');
    });

    it('CS-FCI-002 - retorna la celda cuando existe', async () => {
      // Arrange
      celdaRepository.findOne.resolves(celdaMock);

      // Act
      const result = await service.findCeldaById(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.be.an('object')
        .and.to.have.property('id', 1);
    });

  });

  // ==========================================================================
  // actualizarEstado()
  // ==========================================================================
  describe('actualizarEstado', () => {

    it('CS-AE-001 - actualiza y retorna la celda con el nuevo estado', async () => {
      // Arrange
      const celdaActualizada = { ...celdaMock, estado: 'OCUPADA' };

      sandbox.stub(service, 'findCeldaById').resolves({ ...celdaMock } as any);
      celdaRepository.save.resolves(celdaActualizada);

      // Act
      const result = await service.actualizarEstado(1, 'OCUPADA');

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('estado', 'OCUPADA');

      expect(celdaRepository.save.calledOnce).to.be.true;
    });

    it('CS-AE-002 - lanza excepción cuando la celda a actualizar no existe', async () => {
      // Arrange
      sandbox
        .stub(service, 'findCeldaById')
        .rejects(new Error('No existe celda con id: 99'));

      // Act
      const action = service.actualizarEstado(99, 'OCUPADA');

      // Assert
      await expect(action).to.be.rejectedWith('No existe celda con id: 99');
    });

  });

});