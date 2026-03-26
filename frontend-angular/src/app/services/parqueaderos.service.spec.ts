import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ParqueaderosService } from './parqueaderos.service';
import { environment } from '../../environments/environment';

describe('ParqueaderosService', () => {
  let service: ParqueaderosService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.urlApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParqueaderosService],
    });
    service = TestBed.inject(ParqueaderosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('debe crear un parqueadero correctamente (AAA, FIRST)', (done) => {
      // Arrange
      const dto = { nombre: 'Central', capacidadTotal: 100, ubicacion: 'Centro', idEmpresa: 1 };
      const parqueaderoMock = { id: 10, ...dto };
      // Act
      service.create(dto).subscribe((parqueadero) => {
        // Assert
        expect(parqueadero).toEqual(parqueaderoMock);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/parking-lots`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(parqueaderoMock);
    });
  });

  describe('getByEmpresa', () => {
    it('debe obtener parqueaderos por idEmpresa', (done) => {
      // Arrange
      const idEmpresa = 2;
      const parqueaderosMock = [
        { id: 1, nombre: 'A', capacidadTotal: 50, ubicacion: 'Norte', idEmpresa: 2 },
        { id: 2, nombre: 'B', capacidadTotal: 80, ubicacion: 'Sur', idEmpresa: 2 },
      ];
      // Act
      service.getByEmpresa(idEmpresa).subscribe((parqueaderos) => {
        // Assert
        expect(Array.isArray(parqueaderos)).toBe(true);
        expect(parqueaderos.length).toBe(2);
        expect(parqueaderos[0].idEmpresa).toBe(idEmpresa);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/parking-lots/empresa/${idEmpresa}`);
      expect(req.request.method).toBe('GET');
      req.flush(parqueaderosMock);
    });
  });

  describe('getById', () => {
    it('debe obtener un parqueadero por id', (done) => {
      // Arrange
      const id = 5;
      const parqueaderoMock = { id: 5, nombre: 'Z', capacidadTotal: 120, ubicacion: 'Este', idEmpresa: 3 };
      // Act
      service.getById(id).subscribe((parqueadero) => {
        // Assert
        expect(parqueadero).toEqual(parqueaderoMock);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/parking-lots/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(parqueaderoMock);
    });
  });

  describe('getDisponiblesCliente', () => {
    it('debe obtener parqueaderos disponibles para cliente', (done) => {
      // Arrange
      const parqueaderosMock = [
        { id: 1, nombre: 'A', capacidadTotal: 50, ubicacion: 'Norte', idEmpresa: 2, celdasDisponibles: 10 },
      ];
      // Act
      service.getDisponiblesCliente().subscribe((parqueaderos) => {
        // Assert
        expect(Array.isArray(parqueaderos)).toBe(true);
        expect(parqueaderos.length).toBe(1);
        expect(parqueaderos[0].celdasDisponibles).toBe(10);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/parking-lots/client/disponibles`);
      expect(req.request.method).toBe('GET');
      req.flush(parqueaderosMock);
    });
  });
});
