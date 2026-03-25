import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FacturacionService } from './facturacion.service';
import { environment } from '../../environments/environment';

/**
 * Tests para FacturacionService
 * Patrón AAA (Arrange, Act, Assert)
 * Principios FIRST: Fast, Independent, Repeatable, Self-Checking, Timely
 * Usando HttpClientTestingModule para mockear HTTP
 */

describe('FacturacionService', () => {
  let service: FacturacionService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.urlApi;

  // Setup: Independencia entre tests
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FacturacionService],
    });
    service = TestBed.inject(FacturacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Limpieza: Verificar que no haya requests pendientes
  afterEach(() => {
    httpMock.verify();
  });

  describe('[FAST] obtenerClientesFactura', () => {
    it('F1 debe retornar lista de clientes desde GET /invoicing/clientes', (done) => {
      // Arrange
      const clientesFake = [
        { id: 1, tipoDocumento: 'CC', numeroDocumento: '123', correo: 'a@test.com' },
        { id: 2, tipoDocumento: 'NIT', numeroDocumento: '456', correo: 'b@test.com' },
      ];

      // Act
      service.obtenerClientesFactura().subscribe((result) => {
        // Assert
        expect(result).toEqual(clientesFake);
        expect(result.length).toBe(2);
        done();
      });

      // Assert HTTP
      const req = httpMock.expectOne(`${apiUrl}/invoicing/clientes`);
      expect(req.request.method).toBe('GET');
      req.flush(clientesFake);
    });

    it('F2 debe manejar respuesta vacía correctamente', (done) => {
      // Arrange
      const clientesFake: any[] = [];

      // Act
      service.obtenerClientesFactura().subscribe((result) => {
        // Assert
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/invoicing/clientes`);
      req.flush(clientesFake);
    });
  });

  describe('[INDEPENDENT] crearClienteFactura', () => {
    it('I1 debe hacer POST con DTO correcto', (done) => {
      // Arrange
      const dtoNuevo = {
        tipoDocumento: 'CC',
        numeroDocumento: '999',
        correo: 'nuevo@test.com',
      };
      const clienteCreado = { id: 100, ...dtoNuevo };

      // Act
      service.crearClienteFactura(dtoNuevo).subscribe((result) => {
        // Assert
        expect(result.id).toBe(100);
        expect(result.correo).toBe('nuevo@test.com');
        done();
      });

      // Assert HTTP
      const req = httpMock.expectOne(`${apiUrl}/invoicing/clientes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dtoNuevo);
      req.flush(clienteCreado);
    });

    it('I2 debe fallar si el servidor retorna error 400', (done) => {
      // Arrange
      const dtoInvalido = {
        tipoDocumento: '',
        numeroDocumento: '',
        correo: 'invalid',
      };

      // Act
      service.crearClienteFactura(dtoInvalido).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/invoicing/clientes`);
      req.flush({ error: 'Datos inválidos' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('[REPEATABLE] getFacturas', () => {
    it('R1 debe retornar facturas filtradas por idEmpresa', (done) => {
      // Arrange
      const idEmpresa = 5;
      const facturasFake = [
        { id: 1, idPago: 10, enviada: true, fechaEmision: '2024-01-15' },
        { id: 2, idPago: 11, enviada: false, fechaEmision: '2024-01-16' },
      ];

      // Act
      service.getFacturas(idEmpresa).subscribe((result) => {
        // Assert
        expect(result.length).toBe(2);
        expect(result[0].idPago).toBe(10);
        done();
      });

      // Assert HTTP
      const req = httpMock.expectOne(`${apiUrl}/invoicing/facturas?idEmpresa=${idEmpresa}`);
      expect(req.request.method).toBe('GET');
      req.flush(facturasFake);
    });

    it('R2 parámetro idEmpresa se debe incluir en URL correctamente', (done) => {
      // Arrange
      const idEmpresa = 999;

      // Act
      service.getFacturas(idEmpresa).subscribe(() => {
        done();
      });

      // Assert
      const req = httpMock.expectOne((request) => {
        return request.url.includes(`idEmpresa=${idEmpresa}`);
      });
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('[SELF-CHECKING] crearFactura', () => {
    it('S1 debe enviar POST con DTO completo incluyendo booleanos', (done) => {
      // Arrange
      const dtoFactura = {
        idPago: 25,
        idClienteFactura: 10,
        emitirElectronica: true,
        cufe: 'NF-25-12345',
        correoElectronico: 'cliente@test.com',
      };
      const facturaCreada = {
        id: 200,
        ...dtoFactura,
        fechaEmision: '2024-01-20',
        enviada: false,
      };

      // Act
      service.crearFactura(dtoFactura).subscribe((result) => {
        // Assert
        expect(result.id).toBe(200);
        expect(result.enviada).toBe(false);
        done();
      });

      // Assert HTTP
      const req = httpMock.expectOne(`${apiUrl}/invoicing/facturas`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dtoFactura);
      req.flush(facturaCreada);
    });

    it('S2 debe permitir crear factura con opcionales undefined', (done) => {
      // Arrange
      const dtoMinimo = { idPago: 30 };

      // Act
      service.crearFactura(dtoMinimo).subscribe(() => {
        done();
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/invoicing/facturas`);
      expect(req.request.body).toEqual(dtoMinimo);
      req.flush({ id: 300, ...dtoMinimo });
    });
  });

  describe('[TIMELY] marcarFacturaEnviada', () => {
    it('T1 debe hacer PATCH con ID correcto', (done) => {
      // Arrange
      const facturaId = 50;
      const facturaActualizada = {
        id: facturaId,
        enviada: true,
        fechaEmision: '2024-01-20',
      };

      // Act
      service.marcarFacturaEnviada(facturaId).subscribe((result) => {
        // Assert
        expect(result.enviada).toBe(true);
        done();
      });

      // Assert HTTP
      const req = httpMock.expectOne(`${apiUrl}/invoicing/facturas/${facturaId}/enviar`);
      expect(req.request.method).toBe('PATCH');
      req.flush(facturaActualizada);
    });

    it('T2 debe hacer PATCH con body vacío', (done) => {
      // Arrange
      const facturaId = 51;

      // Act
      service.marcarFacturaEnviada(facturaId).subscribe(() => {
        done();
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/invoicing/facturas/${facturaId}/enviar`);
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('[FAST] getFacturaPorPago', () => {
    it('FP1 debe retornar factura para pago existente', (done) => {
      // Arrange
      const idPago = 100;
      const facturaStub = {
        id: 500,
        idPago: 100,
        enviada: true,
        fechaEmision: '2024-01-15',
      };

      // Act
      service.getFacturaPorPago(idPago).subscribe((result) => {
        // Assert
        expect(result.idPago).toBe(idPago);
        done();
      });

      // Assert HTTP
      const req = httpMock.expectOne(`${apiUrl}/invoicing/facturas/pago/${idPago}`);
      expect(req.request.method).toBe('GET');
      req.flush(facturaStub);
    });
  });

  describe('[INDEPENDENT] getMisFacturasCliente', () => {
    it('MF1 debe usar endpoint correcto sin parámetros', (done) => {
      // Arrange
      const facturasFake = [
        { id: 1, idPago: 10, enviada: true, fechaEmision: '2024-01-15' },
      ];

      // Act
      service.getMisFacturasCliente().subscribe((result) => {
        // Assert
        expect(result).toEqual(facturasFake);
        done();
      });

      // Assert HTTP
      const req = httpMock.expectOne(`${apiUrl}/invoicing/facturas/client/mias`);
      expect(req.request.method).toBe('GET');
      req.flush(facturasFake);
    });
  });
});
