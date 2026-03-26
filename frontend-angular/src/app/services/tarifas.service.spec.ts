import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TarifasService } from './tarifas.service';
import { environment } from '../../environments/environment';

describe('TarifasService', () => {
	let service: TarifasService;
	let httpMock: HttpTestingController;
	const apiUrl = environment.urlApi;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [TarifasService],
		});
		service = TestBed.inject(TarifasService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('create', () => {
		it('debe crear una tarifa correctamente (AAA, FIRST)', (done) => {
			// Arrange
			const dto = { idParqueadero: 1, idTipoVehiculo: 2, precioFraccionHora: 1000, precioHoraAdicional: 500 };
			const parqueaderoMock = { id: 1, nombre: 'Central', capacidadTotal: 100, ubicacion: 'Centro', idEmpresa: 1 };
			const tipoVehiculoMock = { id: 2, nombre: 'Carro' };
			const tarifaMock = { id: 10, ...dto, parqueadero: parqueaderoMock, tipoVehiculo: tipoVehiculoMock };
			// Act
			service.create(dto).subscribe((tarifa) => {
				// Assert
				expect(tarifa.id).toBe(10);
				expect(tarifa.precioFraccionHora).toBe(1000);
				expect(tarifa.parqueadero).toEqual(parqueaderoMock);
				expect(tarifa.tipoVehiculo).toEqual(tipoVehiculoMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/rates`);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual(dto);
			req.flush(tarifaMock);
		});
	});

	describe('getByParqueadero', () => {
		it('debe obtener tarifas por idParqueadero', (done) => {
			// Arrange
			const idParqueadero = 2;
			const parqueaderoMock = { id: 2, nombre: 'Norte', capacidadTotal: 80, ubicacion: 'Zona Norte', idEmpresa: 1 };
			const tipoVehiculoMock = { id: 1, nombre: 'Moto' };
			const tarifasMock = [
				{ id: 1, idParqueadero: 2, idTipoVehiculo: 1, precioFraccionHora: 800, parqueadero: parqueaderoMock, tipoVehiculo: tipoVehiculoMock },
			];
			// Act
			service.getByParqueadero(idParqueadero).subscribe((tarifas) => {
				// Assert
				expect(Array.isArray(tarifas)).toBe(true);
				expect(tarifas.length).toBe(1);
				expect(tarifas[0].idParqueadero).toBe(idParqueadero);
				expect(tarifas[0].parqueadero).toEqual(parqueaderoMock);
				expect(tarifas[0].tipoVehiculo).toEqual(tipoVehiculoMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/rates/parqueadero/${idParqueadero}`);
			expect(req.request.method).toBe('GET');
			req.flush(tarifasMock);
		});
	});

	describe('getById', () => {
		it('debe obtener una tarifa por id', (done) => {
			// Arrange
			const id = 5;
			const parqueaderoMock = { id: 1, nombre: 'Central', capacidadTotal: 100, ubicacion: 'Centro', idEmpresa: 1 };
			const tipoVehiculoMock = { id: 2, nombre: 'Carro' };
			const tarifaMock = { id: 5, idParqueadero: 1, idTipoVehiculo: 2, precioFraccionHora: 1200, parqueadero: parqueaderoMock, tipoVehiculo: tipoVehiculoMock };
			// Act
			service.getById(id).subscribe((tarifa) => {
				// Assert
				expect(tarifa).toEqual(tarifaMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/rates/${id}`);
			expect(req.request.method).toBe('GET');
			req.flush(tarifaMock);
		});
	});

	describe('update', () => {
		it('debe actualizar una tarifa correctamente', (done) => {
			// Arrange
			const id = 7;
			const dto = { precioFraccionHora: 1500, precioHoraAdicional: 700 };
			const parqueaderoMock = { id: 1, nombre: 'Central', capacidadTotal: 100, ubicacion: 'Centro', idEmpresa: 1 };
			const tipoVehiculoMock = { id: 2, nombre: 'Carro' };
			const tarifaMock = { id: 7, idParqueadero: 1, idTipoVehiculo: 2, precioFraccionHora: 1500, precioHoraAdicional: 700, parqueadero: parqueaderoMock, tipoVehiculo: tipoVehiculoMock };
			// Act
			service.update(id, dto).subscribe((tarifa) => {
				// Assert
				expect(tarifa.precioFraccionHora).toBe(1500);
				expect(tarifa.precioHoraAdicional).toBe(700);
				expect(tarifa.parqueadero).toEqual(parqueaderoMock);
				expect(tarifa.tipoVehiculo).toEqual(tipoVehiculoMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/rates/${id}`);
			expect(req.request.method).toBe('PATCH');
			expect(req.request.body).toEqual(dto);
			req.flush(tarifaMock);
		});
	});
});
