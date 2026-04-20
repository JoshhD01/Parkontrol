import { createTestingModule } from './vistas.service.spec';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('VistasService', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // getOcupacionByEmpresa()
  // ==========================================================================
  describe('getOcupacionByEmpresa', () => {

    it('VS-GOBE-001 - retorna resultados transformados cuando idEmpresa tiene valor', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { ID_PARQUEADERO: 1, NOMBRE_PARQUEADERO: 'P1', TOTAL_CELDAS: 10 },
      ]);

      // Act
      const result = await service.getOcupacionByEmpresa(1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('idParqueadero', 1);
      expect(result[0]).to.have.property('nombreParqueadero', 'P1');
    });

    it('VS-GOBE-002 - retorna resultados transformados cuando idEmpresa es null', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { ID_PARQUEADERO: 1, NOMBRE_PARQUEADERO: 'P1', TOTAL_CELDAS: 10 },
        { ID_PARQUEADERO: 2, NOMBRE_PARQUEADERO: 'P2', TOTAL_CELDAS: 5  },
      ]);

      // Act
      const result = await service.getOcupacionByEmpresa(null);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(2);
      expect(dataSource.query.calledOnce).to.be.true;
    });

  });

  // ==========================================================================
  // getOcupacionByParqueadero()
  // ==========================================================================
  describe('getOcupacionByParqueadero', () => {

    it('VS-GOBP-001 - retorna primer elemento transformado cuando existe resultado', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { ID_PARQUEADERO: 1, NOMBRE_PARQUEADERO: 'P1', CELDAS_OCUPADAS: 3 },
      ]);

      // Act
      const result = await service.getOcupacionByParqueadero(1);

      // Assert
      expect(result)
        .to.exist
        .and.to.have.property('idParqueadero', 1);
    });

    it('VS-GOBP-002 - retorna null cuando no existe resultado', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.getOcupacionByParqueadero(999);

      // Assert
      expect(result).to.be.null;
    });

  });

  // ==========================================================================
  // getHistorialByEmpresa()
  // ==========================================================================
  describe('getHistorialByEmpresa', () => {

    it('VS-GHBE-001 - retorna historial transformado cuando idEmpresa tiene valor', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { ID_RESERVA: 1, PLACA: 'ABC123', ESTADO: 'CERRADA' },
      ]);

      // Act
      const result = await service.getHistorialByEmpresa(1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('idReserva', 1);
      expect(result[0]).to.have.property('placa', 'ABC123');
    });

    it('VS-GHBE-002 - retorna historial transformado cuando idEmpresa es null', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.getHistorialByEmpresa(null);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
      expect(dataSource.query.calledOnce).to.be.true;
    });

  });

  // ==========================================================================
  // getHistorialByPlacaAndParqueadero()
  // ==========================================================================
  describe('getHistorialByPlacaAndParqueadero', () => {

    it('VS-GHBPP-001 - retorna historial cuando existen reservas para la placa y parqueadero', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { ID_RESERVA: 1, PLACA: 'ABC123', PARQUEADERO: 'P1' },
      ]);

      // Act
      const result = await service.getHistorialByPlacaAndParqueadero('ABC123', 1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('placa', 'ABC123');
    });

    it('VS-GHBPP-002 - retorna array vacío cuando no existen reservas', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.getHistorialByPlacaAndParqueadero('XYZ999', 1);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // getFacturacionByEmpresa()
  // ==========================================================================
  describe('getFacturacionByEmpresa', () => {

    it('VS-GFBE-001 - retorna facturación transformada cuando idEmpresa tiene valor', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { ID_FACTURA_ELECTRONICA: 1, MONTO: 50000, METODO_PAGO: 'Efectivo' },
      ]);

      // Act
      const result = await service.getFacturacionByEmpresa(1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('idFacturaElectronica', 1);
      expect(result[0]).to.have.property('metodoPago', 'Efectivo');
    });

    it('VS-GFBE-002 - retorna facturación transformada cuando idEmpresa es null', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.getFacturacionByEmpresa(null);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
      expect(dataSource.query.calledOnce).to.be.true;
    });

  });

  // ==========================================================================
  // getFacturacionByDocumento()
  // ==========================================================================
  describe('getFacturacionByDocumento', () => {

    it('VS-GFBD-001 - retorna facturas cuando existen para el documento e idEmpresa tiene valor', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { ID_FACTURA_ELECTRONICA: 1, NUMERO_DOCUMENTO: '123', MONTO: 30000 },
      ]);

      // Act
      const result = await service.getFacturacionByDocumento('123', 1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('numeroDocumento', '123');
    });

    it('VS-GFBD-002 - retorna facturas cuando idEmpresa es null', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.getFacturacionByDocumento('123', null);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
      expect(dataSource.query.calledOnce).to.be.true;
    });

  });

  // ==========================================================================
  // getIngresosByEmpresa()
  // ==========================================================================
  describe('getIngresosByEmpresa', () => {

    it('VS-GIBE-001 - retorna ingresos transformados cuando idEmpresa tiene valor', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { EMPRESA: 'Emp1', PARQUEADERO: 'P1', PERIODO: '2024-01', TOTAL_INGRESOS: 100000 },
      ]);

      // Act
      const result = await service.getIngresosByEmpresa(1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('empresa', 'Emp1');
      expect(result[0]).to.have.property('totalIngresos', 100000);
    });

    it('VS-GIBE-002 - retorna ingresos transformados cuando idEmpresa es null', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.getIngresosByEmpresa(null);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
      expect(dataSource.query.calledOnce).to.be.true;
    });

  });

  // ==========================================================================
  // getIngresosByParqueadero()
  // ==========================================================================
  describe('getIngresosByParqueadero', () => {

    it('VS-GIBP-001 - retorna ingresos cuando existen para el parqueadero', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([
        { EMPRESA: 'Emp1', PARQUEADERO: 'P1', PERIODO: '2024-01', TOTAL_INGRESOS: 50000 },
      ]);

      // Act
      const result = await service.getIngresosByParqueadero(1);

      // Assert
      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('parqueadero', 'P1');
    });

    it('VS-GIBP-002 - retorna array vacío cuando no existen ingresos', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.getIngresosByParqueadero(999);

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

  });

  // ==========================================================================
  // procesarPago()
  // ==========================================================================
  describe('procesarPago', () => {

    it('VS-PP-001 - retorna monto cuando la query devuelve resultado', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([{ monto: 21000 }]);

      // Act
      const result = await service.procesarPago(1, 1);

      // Assert
      expect(result).to.have.property('monto', 21000);
    });

    it('VS-PP-002 - retorna monto 0 cuando la query devuelve resultado vacío', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.procesarPago(1, 1);

      // Assert
      expect(result).to.have.property('monto', 0);
    });

  });

  // ==========================================================================
  // buscarVehiculoPorPlaca()
  // ==========================================================================
  describe('buscarVehiculoPorPlaca', () => {

    it('VS-BVPP-001 - retorna mensaje cuando la query devuelve resultado', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([{ mensaje: 'Vehículo encontrado' }]);

      // Act
      const result = await service.buscarVehiculoPorPlaca('ABC123');

      // Assert
      expect(result).to.have.property('mensaje', 'Vehículo encontrado');
    });

    it('VS-BVPP-002 - retorna mensaje vacío cuando la query no devuelve resultado', async () => {
      // Arrange
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([]);

      // Act
      const result = await service.buscarVehiculoPorPlaca('XYZ999');

      // Assert
      expect(result).to.have.property('mensaje', '');
    });

  });

});