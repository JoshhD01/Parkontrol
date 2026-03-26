import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CeldasService } from './celdas.service';
import { environment } from '../../environments/environment';
import { Celda, CrearCeldaDto } from '../models/celda.model';

describe('CeldasService', () => {
  let service: CeldasService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.urlApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CeldasService],
    });
    service = TestBed.inject(CeldasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a celda and return it', (done) => {
      // Arrange
      const dto: CrearCeldaDto = {
        idParqueadero: 1,
        idTipoCelda: 2,
        idSensor: 3,
        estado: 'LIBRE',
      };
      const celdaFake: Celda = {
        id: 10,
        ...dto,
      };
      // Act
      service.create(dto).subscribe(res => {
        // Assert
        expect(res).toEqual(celdaFake);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/cells`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(celdaFake);
    });
  });

  describe('getByParqueadero', () => {
    it('should return celdas for a parqueadero', (done) => {
      // Arrange
      const idParqueadero = 1;
      const celdasFake: Celda[] = [
        { id: 1, idParqueadero: 1, idTipoCelda: 2, idSensor: 3, estado: 'LIBRE' },
      ];
      // Act
      service.getByParqueadero(idParqueadero).subscribe(res => {
        // Assert
        expect(res).toEqual(celdasFake);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/cells/parqueadero/${idParqueadero}`);
      expect(req.request.method).toBe('GET');
      req.flush(celdasFake);
    });
  });

  describe('getById', () => {
    it('should return a celda by id', (done) => {
      // Arrange
      const id = 2;
      const celdaFake: Celda = { id: 2, idParqueadero: 1, idTipoCelda: 2, idSensor: 3, estado: 'OCUPADA' };
      // Act
      service.getById(id).subscribe(res => {
        // Assert
        expect(res).toEqual(celdaFake);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/cells/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(celdaFake);
    });
  });

  describe('updateEstado', () => {
    it('should update celda estado and return it', (done) => {
      // Arrange
      const id = 3;
      const estado = 'OCUPADA';
      const celdaFake: Celda = { id: 3, idParqueadero: 1, idTipoCelda: 2, idSensor: 3, estado };
      // Act
      service.updateEstado(id, estado).subscribe(res => {
        // Assert
        expect(res).toEqual(celdaFake);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/cells/${id}/estado`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ estado });
      req.flush(celdaFake);
    });
  });
});
