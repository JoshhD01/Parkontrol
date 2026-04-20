import { createTestingModule } from '../unitaria/vistas/vistas.service.module';

describe('VistasService Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOcupacionByEmpresa', () => {
    it('should return ocupacion for empresa', async () => {
      const { service, ocupacionRepo } = await createTestingModule();

      const data = [{ idParqueadero: 1 }];
      ocupacionRepo.find.resolves(data);

      const result = await service.getOcupacionByEmpresa(1);

      expect(result).toEqual(data);
    });
  });

  describe('getOcupacionByParqueadero', () => {
    it('should return ocupacion for parqueadero', async () => {
      const { service, ocupacionRepo } = await createTestingModule();

      const data = [{ idParqueadero: 1 }];
      ocupacionRepo.find.resolves(data);

      const result = await service.getOcupacionByParqueadero(1);

      expect(result).toEqual(data);
    });
  });

  describe('getHistorialByEmpresa', () => {
    it('should return historial for empresa', async () => {
      const { service, historialRepo } = await createTestingModule();

      const data = [{ id: 1 }];
      historialRepo.find.resolves(data);

      const result = await service.getHistorialByEmpresa(1);

      expect(result).toEqual(data);
    });
  });

  describe('getFacturacionByEmpresa', () => {
    it('should return facturacion for empresa', async () => {
      const { service, facturacionRepo } = await createTestingModule();

      const data = [{ id: 1 }];
      facturacionRepo.find.resolves(data);

      const result = await service.getFacturacionByEmpresa(1);

      expect(result).toEqual(data);
    });
  });

  describe('getIngresosByEmpresa', () => {
    it('should return ingresos for empresa', async () => {
      const { service, ingresosRepo } = await createTestingModule();

      const data = [{ id: 1 }];
      ingresosRepo.find.resolves(data);

      const result = await service.getIngresosByEmpresa(1);

      expect(result).toEqual(data);
    });
  });

  describe('procesarPago', () => {
    it('should process pago', async () => {
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([{ monto: 1000 }]);

      const result = await service.procesarPago(1);

      expect(result.monto).toBe(1000);
    });
  });

  describe('buscarVehiculoPorPlaca', () => {
    it('should search vehiculo by placa', async () => {
      const { service, dataSource } = await createTestingModule();

      dataSource.query.resolves([{ mensaje: 'Found' }]);

      const result = await service.buscarVehiculoPorPlaca('ABC123');

      expect(result.mensaje).toBe('Found');
    });
  });
});