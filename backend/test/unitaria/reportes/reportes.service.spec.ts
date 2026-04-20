import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);

const expect = chai.expect as any;

import { ReportesService } from 'src/service/reportes/reportes.service';
import { Reporte } from 'src/entities/reportes/entities/reporte.entity';
import { Periodo } from 'src/entities/shared/entities/periodo.entity';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';


// ─── Helper ──────────────────────────────────────────────────────────────────
// FIRST → Isolated: genera stubs frescos por cada test, sin estado compartido
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('ReportesService', () => {

  let service: ReportesService;
  let reporteRepository: Record<string, any>;
  let periodoRepository: Record<string, any>;
  let parqueaderosService: Record<string, any>;

  // Sandbox de sinon — restaura todos los stubs/spies al hacer restore()
  const sandbox = sinon.createSandbox();

  // ── Fixtures ─────────────────────────────────────────────────────────────
  const parqueaderoMock = { id: 1 };
  const periodoMock     = { id: 1 };
  const reporteMock     = { id: 1 };

  // ── Setup ─────────────────────────────────────────────────────────────────
  // FIRST → Fast + Isolated: módulo recompilado con stubs frescos en cada test
  beforeEach(async () => {
    reporteRepository   = makeStub(['create', 'save', 'find', 'findOne']);
    periodoRepository   = makeStub(['findOne']);
    parqueaderosService = makeStub(['findParqueaderoById']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: getRepositoryToken(Reporte), useValue: reporteRepository },
        { provide: getRepositoryToken(Periodo), useValue: periodoRepository },
        { provide: ParqueaderosService,         useValue: parqueaderosService },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
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
      idPeriodo:     1,
      urlArchivo:    'url',
    };

    it('RS-CREAR-001 - lanza excepción cuando el periodo no existe', async () => {
      // Arrange
      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      periodoRepository.findOne.resolves(null);

      // Act
      const action = service.crear(dtoBase as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        `No existe periodo con id: ${dtoBase.idPeriodo}`,
      );
    });

    it('RS-CREAR-002 - crea y retorna el reporte cuando el periodo existe', async () => {
      // Arrange
      parqueaderosService.findParqueaderoById.resolves(parqueaderoMock);
      periodoRepository.findOne.resolves(periodoMock);
      reporteRepository.create.returns(reporteMock);
      reporteRepository.save.resolves(reporteMock);

      // Act
      const result = await service.crear(dtoBase as any);

      // Assert
      expect(reporteRepository.create.calledOnce).to.be.true;
      expect(reporteRepository.save.calledOnce).to.be.true;
      expect(result)
        .to.exist
        .and.to.be.an('object');
    });

  });

  // ==========================================================================
  // findByParqueadero()
  // ==========================================================================
  describe('findByParqueadero', () => {

    it('RS-FBP-001 - retorna lista de reportes del parqueadero', async () => {
      // Arrange
      reporteRepository.find.resolves([reporteMock]);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);

      expect(reporteRepository.find.called).to.be.true;
    });

    it('RS-FBP-002 - retorna lista vacía cuando no hay reportes', async () => {
      // Arrange
      reporteRepository.find.resolves([]);

      // Act
      const result = await service.findByParqueadero(1);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // findReporteById()
  // ==========================================================================
  describe('findReporteById', () => {

    it('RS-FRI-001 - lanza excepción cuando el reporte no existe', async () => {
      // Arrange
      reporteRepository.findOne.resolves(null);

      // Act
      const action = service.findReporteById(1);

      // Assert
      await expect(action).to.be.rejectedWith('No existe reporte con id: 1');
    });

    it('RS-FRI-002 - retorna el reporte cuando existe', async () => {
      // Arrange
      reporteRepository.findOne.resolves(reporteMock);

      // Act
      const result = await service.findReporteById(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

  });

  // ==========================================================================
  // actualizarUrl()
  // ==========================================================================
  describe('actualizarUrl', () => {

    it('RS-AU-001 - actualiza y retorna el reporte con la nueva url', async () => {
      // Arrange
      const reporteExistente  = { id: 1, urlArchivo: 'old' };
      const reporteActualizado = { ...reporteExistente, urlArchivo: 'new' };

      sandbox.stub(service, 'findReporteById').resolves(reporteExistente as any);
      reporteRepository.save.resolves(reporteActualizado);

      // Act
      const result = await service.actualizarUrl(1, 'new');

      // Assert
      expect(reporteRepository.save.calledOnce).to.be.true;
      expect(result).to.have.property('urlArchivo', 'new');
    });

    it('RS-AU-002 - lanza excepción cuando el reporte a actualizar no existe', async () => {
      // Arrange
      sandbox
        .stub(service, 'findReporteById')
        .rejects(new Error('No existe reporte con id: 1'));

      // Act
      const action = service.actualizarUrl(1, 'new');

      // Assert
      await expect(action).to.be.rejectedWith('No existe reporte con id: 1');
    });

  });

});