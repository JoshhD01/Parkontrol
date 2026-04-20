import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);

const expect = chai.expect as any;

import { EmpresasService } from 'src/service/empresas/empresas.service';
import { Empresa } from 'src/entities/empresas/entities/empresa.entity';
import { EmpresaResponseDto } from 'src/controller/empresas/dto/empresa-response.dto';


// ─── Helper ──────────────────────────────────────────────────────────────────
// FIRST → Isolated: genera stubs frescos por cada test, sin estado compartido
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('EmpresasService', () => {

  let service: EmpresasService;
  let empresaRepository: Record<string, any>;

  // Sandbox de sinon — restaura todos los stubs/spies al hacer restore()
  const sandbox = sinon.createSandbox();

  // ── Fixtures ─────────────────────────────────────────────────────────────
  const empresaMock = { id: 1, nombre: 'Empresa Test' };

  // ── Setup ─────────────────────────────────────────────────────────────────
  // FIRST → Fast + Isolated: módulo recompilado con stubs frescos en cada test
  beforeEach(async () => {
    empresaRepository = makeStub(['create', 'save', 'findOneBy', 'find']);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresasService,
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
      ],
    }).compile();

    service = module.get<EmpresasService>(EmpresasService);
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

    it('ES-CREAR-001 - crea y guarda empresa correctamente', async () => {
      // Arrange
      const dto = { nombre: 'Empresa Test' };

      empresaRepository.create.returns(empresaMock);
      empresaRepository.save.resolves(empresaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(empresaRepository.create.calledWith(dto)).to.be.true;
      expect(empresaRepository.save.calledOnce).to.be.true;
      expect(result).to.be.instanceOf(EmpresaResponseDto);
    });

  });

  // ==========================================================================
  // findEmpresaById()
  // ==========================================================================
  describe('findEmpresaById', () => {

    it('ES-FEI-001 - lanza excepción cuando la empresa no existe', async () => {
      // Arrange
      empresaRepository.findOneBy.resolves(null);

      // Act
      const action = service.findEmpresaById(1);

      // Assert
      await expect(action).to.be.rejectedWith('Empresa con id: 1 no existe');
    });

    it('ES-FEI-002 - retorna la empresa cuando existe', async () => {
      // Arrange
      empresaRepository.findOneBy.resolves(empresaMock);

      // Act
      const result = await service.findEmpresaById(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('id', 1);
    });

  });

  // ==========================================================================
  // findAll()
  // ==========================================================================
  describe('findAll', () => {

    it('ES-FA-001 - retorna lista de empresas', async () => {
      // Arrange
      empresaRepository.find.resolves([empresaMock]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);

      expect(result[0]).to.be.instanceOf(EmpresaResponseDto);
    });

    it('ES-FA-002 - retorna lista vacía cuando no hay empresas', async () => {
      // Arrange
      empresaRepository.find.resolves([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // obtenerDetalle()
  // ==========================================================================
  describe('obtenerDetalle', () => {

    it('ES-OD-001 - retorna detalle cuando la empresa existe', async () => {
      // Arrange
      sandbox.stub(service, 'findEmpresaById').resolves(empresaMock as any);

      // Act
      const result = await service.obtenerDetalle(1);

      // Assert
      expect(result).to.be.instanceOf(EmpresaResponseDto);
    });

    it('ES-OD-002 - lanza excepción cuando la empresa no existe', async () => {
      // Arrange
      sandbox
        .stub(service, 'findEmpresaById')
        .rejects(new Error('Empresa con id: 1 no existe'));

      // Act
      const action = service.obtenerDetalle(1);

      // Assert
      await expect(action).to.be.rejectedWith('Empresa con id: 1 no existe');
    });

  });

  // ==========================================================================
  // obtenerTodas()
  // ==========================================================================
  describe('obtenerTodas', () => {

    it('ES-OT-001 - retorna lista de empresas', async () => {
      // Arrange
      sandbox.stub(service, 'findAll').resolves([{} as any]);

      // Act
      const result = await service.obtenerTodas();

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(1);
    });

    it('ES-OT-002 - retorna lista vacía cuando no hay empresas', async () => {
      // Arrange
      sandbox.stub(service, 'findAll').resolves([]);

      // Act
      const result = await service.obtenerTodas();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

});