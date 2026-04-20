import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);

const expect = chai.expect as any;

import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';
import { Parqueadero } from 'src/entities/parqueaderos/entities/parqueadero.entity';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { TipoCelda } from 'src/entities/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/entities/shared/entities/sensor.entity';
import { EmpresasService } from 'src/service/empresas/empresas.service';


// ─── Helper ──────────────────────────────────────────────────────────────────
// FIRST → Isolated: genera stubs frescos por cada test, sin estado compartido
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('ParqueaderosService', () => {

  let service: ParqueaderosService;
  let parqueaderoRepository: Record<string, any>;
  let celdaRepository: Record<string, any>;
  let tipoCeldaRepository: Record<string, any>;
  let sensorRepository: Record<string, any>;
  let empresasService: Record<string, any>;

  // Sandbox de sinon — restaura todos los stubs/spies al hacer restore()
  const sandbox = sinon.createSandbox();

  // ── Setup ─────────────────────────────────────────────────────────────────
  // FIRST → Fast + Isolated: módulo recompilado con stubs frescos en cada test
  beforeEach(async () => {
    parqueaderoRepository = makeStub(['create', 'save', 'findOne', 'find']);
    celdaRepository       = makeStub(['count', 'create', 'save']);
    tipoCeldaRepository   = makeStub(['findOne']);
    sensorRepository      = makeStub(['create', 'save']);
    empresasService       = makeStub(['findEmpresaById']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParqueaderosService,
        { provide: getRepositoryToken(Parqueadero), useValue: parqueaderoRepository },
        { provide: getRepositoryToken(Celda),        useValue: celdaRepository },
        { provide: getRepositoryToken(TipoCelda),    useValue: tipoCeldaRepository },
        { provide: getRepositoryToken(Sensor),       useValue: sensorRepository },
        { provide: EmpresasService,                  useValue: empresasService },
      ],
    }).compile();

    service = module.get<ParqueaderosService>(ParqueaderosService);
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

    it('PS-CREAR-001 - crea un parqueadero y genera sus celdas correctamente', async () => {
      // Arrange
      const dto = {
        nombre: 'Parking Test',
        capacidadTotal: 2,
        ubicacion: 'Centro',
        idEmpresa: 1,
      };

      const empresaMock     = { id: 1 };
      const parqueaderoMock = { id: 10, ...dto, empresa: empresaMock };

      empresasService.findEmpresaById.resolves(empresaMock);
      parqueaderoRepository.create.returns(parqueaderoMock);
      parqueaderoRepository.save.resolves(parqueaderoMock);

      celdaRepository.count.resolves(0);

      // Primera llamada: tipoCelda no existe → se crea; segunda: ya existe
      tipoCeldaRepository.findOne
        .onFirstCall().resolves(null)
        .onSecondCall().resolves({ id: 1, nombre: 'DEFAULT' });

      sensorRepository.create.callsFake((data: any) => data);
      sensorRepository.save.resolves([{ id: 1 }, { id: 2 }]);

      celdaRepository.create.callsFake((data: any) => data);
      celdaRepository.save.resolves([]);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(result).to.exist;
      expect(parqueaderoRepository.save.calledOnce).to.be.true;
      expect(sensorRepository.save.called).to.be.true;
      expect(celdaRepository.save.called).to.be.true;
    });

  });

  // ==========================================================================
  // asegurarCapacidadCeldas()
  // ==========================================================================
  describe('asegurarCapacidadCeldas', () => {

    it('PS-ACC-001 - no crea celdas si el parqueadero ya cumple la capacidad', async () => {
      // Arrange
      const parqueadero = { id: 1, capacidadTotal: 2 };

      celdaRepository.count.resolves(2);

      // Act
      await (service as any).asegurarCapacidadCeldas(parqueadero);

      // Assert
      expect(sensorRepository.save.called).to.be.false;
      expect(celdaRepository.save.called).to.be.false;
    });

    it('PS-ACC-002 - lanza excepción cuando no existe ningún tipo de celda', async () => {
      // Arrange
      const parqueadero = { id: 1, capacidadTotal: 1 };

      celdaRepository.count.resolves(0);
      tipoCeldaRepository.findOne
        .onFirstCall().resolves(null)
        .onSecondCall().resolves(null);

      // Act
      const action = (service as any).asegurarCapacidadCeldas(parqueadero);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

  // ==========================================================================
  // findParqueaderoById()
  // ==========================================================================
  describe('findParqueaderoById', () => {

    it('PS-FPI-001 - retorna el parqueadero cuando existe', async () => {
      // Arrange
      const parqueadero = { id: 1, capacidadTotal: 0 };

      parqueaderoRepository.findOne.resolves(parqueadero);

      // Act
      const result = await service.findParqueaderoById(1);

      // Assert
      expect(result).to.deep.equal(parqueadero);
    });

    it('PS-FPI-002 - lanza excepción cuando el parqueadero no existe', async () => {
      // Arrange
      parqueaderoRepository.findOne.resolves(null);

      // Act
      const action = service.findParqueaderoById(1);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
    });

  });

  // ==========================================================================
  // findAllConDisponibilidad()
  // ==========================================================================
  describe('findAllConDisponibilidad', () => {

    it('PS-FAD-001 - retorna parqueaderos con el conteo de celdas disponibles', async () => {
      // Arrange
      const parqueaderos = [{ id: 1, capacidadTotal: 0, empresa: {} }];

      parqueaderoRepository.find.resolves(parqueaderos);
      celdaRepository.count.resolves(5);

      // Act
      const result = await service.findAllConDisponibilidad();

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);

      expect(result[0]).to.have.property('celdasDisponibles', 5);
    });

    it('PS-FAD-002 - retorna lista vacía cuando no hay parqueaderos', async () => {
      // Arrange
      parqueaderoRepository.find.resolves([]);

      // Act
      const result = await service.findAllConDisponibilidad();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

});