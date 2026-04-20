import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from './parqueaderos.controller.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

import { ParqueaderoResponseDto } from 'src/controller/parqueaderos/dto/parqueadero-response.dto';

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('ParqueaderosController', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // obtenerDisponiblesParaCliente()
  // ==========================================================================
  describe('obtenerDisponiblesParaCliente', () => {

    it('PLC-ODC-001 - retorna parqueaderos con disponibilidad cuando existen registros', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const parqueaderosMock = [
        { id: 1, nombre: 'P1', capacidadTotal: 10, ubicacion: 'Loc1', celdasDisponibles: 5 },
        { id: 2, nombre: 'P2', capacidadTotal: 20, ubicacion: 'Loc2', celdasDisponibles: 8 },
      ];

      sandbox.stub(service, 'findAllConDisponibilidad').resolves(parqueaderosMock as any);

      // Act
      const result = await controller.obtenerDisponiblesParaCliente();

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(2);

      expect(result[0]).to.have.property('celdasDisponibles', 5);
    });

    it('PLC-ODC-002 - retorna lista vacía cuando no hay parqueaderos', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      sandbox.stub(service, 'findAllConDisponibilidad').resolves([]);

      // Act
      const result = await controller.obtenerDisponiblesParaCliente();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // crear()
  // ==========================================================================
  describe('crear', () => {

    it('PLC-CR-001 - crea parqueadero correctamente con dto válido', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto = {
        nombre:         'Parqueadero Test',
        capacidadTotal: 10,
        ubicacion:      'Calle 123',
        idEmpresa:      1,
      };

      const responseMock = new ParqueaderoResponseDto({
        id:             1,
        nombre:         'Parqueadero Test',
        capacidadTotal: 10,
        ubicacion:      'Calle 123',
        empresa:        { id: 1 },
      } as any);

      sandbox.stub(service, 'crear').resolves(responseMock);

      // Act
      const result = await controller.crear(dto as any);

      // Assert
      expect(result)
        .to.exist
        .and.to.be.instanceOf(ParqueaderoResponseDto);

      expect(result).to.have.property('nombre', 'Parqueadero Test');
    });

    it('PLC-CR-002 - lanza NotFoundException cuando empresa no existe', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto = {
        nombre:         'Parqueadero Test',
        capacidadTotal: 10,
        ubicacion:      'Calle 123',
        idEmpresa:      999,
      };

      sandbox.stub(service, 'crear').rejects(
        new NotFoundException('Empresa con id: 999 no existe'),
      );

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        NotFoundException,
        'Empresa con id: 999 no existe',
      );
    });

    it('PLC-CR-003 - dto con nombre menor a 3 caracteres propaga error del servicio', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto = {
        nombre:         'AB',
        capacidadTotal: 10,
        ubicacion:      'Calle 123',
        idEmpresa:      1,
      };

      sandbox.stub(service, 'crear').rejects(new Error('nombre inválido'));

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('nombre inválido');
    });

    it('PLC-CR-004 - dto con ubicacion menor a 5 caracteres propaga error del servicio', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto = {
        nombre:         'Parqueadero Test',
        capacidadTotal: 10,
        ubicacion:      'Cal',
        idEmpresa:      1,
      };

      sandbox.stub(service, 'crear').rejects(new Error('ubicacion inválida'));

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('ubicacion inválida');
    });

    it('PLC-CR-005 - dto con capacidadTotal como string propaga error del servicio', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto = {
        nombre:         'Parqueadero Test',
        capacidadTotal: 'diez' as any,
        ubicacion:      'Calle 123',
        idEmpresa:      1,
      };

      sandbox.stub(service, 'crear').rejects(new Error('capacidadTotal inválido'));

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith('capacidadTotal inválido');
    });

    it('PLC-CR-006 - lanza NotFoundException cuando no existe tipo de celda para inicializar', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const dto = {
        nombre:         'Parqueadero Test',
        capacidadTotal: 10,
        ubicacion:      'Calle 123',
        idEmpresa:      1,
      };

      sandbox.stub(service, 'crear').rejects(
        new NotFoundException('No existe tipo de celda para inicializar capacidad del parqueadero'),
      );

      // Act
      const action = controller.crear(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(
        NotFoundException,
        'No existe tipo de celda para inicializar capacidad del parqueadero',
      );
    });

  });

  // ==========================================================================
  // findAll()
  // ==========================================================================
  describe('findAll', () => {

    it('PLC-FA-001 - retorna parqueaderos cuando existen para la empresa', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const parqueaderosMock = [
        new ParqueaderoResponseDto({ id: 1, nombre: 'P1', capacidadTotal: 10, ubicacion: 'Loc1', empresa: { id: 1 } } as any),
        new ParqueaderoResponseDto({ id: 2, nombre: 'P2', capacidadTotal: 5,  ubicacion: 'Loc2', empresa: { id: 1 } } as any),
      ];

      sandbox.stub(service, 'findByEmpresa').resolves(parqueaderosMock);

      // Act
      const result = await controller.findAll(1);

      // Assert
      expect(result)
        .to.be.an('array')
        .with.lengthOf(2);

      expect(result[0]).to.be.instanceOf(ParqueaderoResponseDto);
    });

    it('PLC-FA-002 - retorna lista vacía cuando empresa no tiene parqueaderos', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      sandbox.stub(service, 'findByEmpresa').resolves([]);

      // Act
      const result = await controller.findAll(999);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // obtenerDetalle()
  // ==========================================================================
  describe('obtenerDetalle', () => {

    it('PLC-OD-001 - retorna detalle cuando parqueadero existe', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      const responseMock = new ParqueaderoResponseDto({
        id:             1,
        nombre:         'P1',
        capacidadTotal: 10,
        ubicacion:      'Loc1',
        empresa:        { id: 1 },
      } as any);

      sandbox.stub(service, 'obtenerDetalle').resolves(responseMock);

      // Act
      const result = await controller.obtenerDetalle(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.be.instanceOf(ParqueaderoResponseDto);

      expect(result).to.have.property('id', 1);
    });

    it('PLC-OD-002 - lanza NotFoundException cuando parqueadero no existe', async () => {
      // Arrange
      const { controller, service } = await createTestingModule();

      sandbox.stub(service, 'obtenerDetalle').rejects(
        new NotFoundException('Parqueadero con id: 999 no existe'),
      );

      // Act
      const action = controller.obtenerDetalle(999);

      // Assert
      await expect(action).to.be.rejectedWith(
        NotFoundException,
        'Parqueadero con id: 999 no existe',
      );
    });

  });

});