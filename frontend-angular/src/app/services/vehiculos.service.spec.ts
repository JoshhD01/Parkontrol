import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VehiculosService } from './vehiculos.service';
import { environment } from '../../environments/environment';

describe('VehiculosService', () => {
	let service: VehiculosService;
	let httpMock: HttpTestingController;
	const apiUrl = `${environment.urlApi}/vehicles`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [VehiculosService],
		});
		service = TestBed.inject(VehiculosService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('getByPlaca', () => {
		it('debe obtener un vehículo por placa', (done) => {
			// Arrange
			const placa = 'ABC123';
			const vehiculoMock = { id: 1, placa: 'ABC123', idTipoVehiculo: 2 };
			// Act
			service.getByPlaca(placa).subscribe((vehiculo) => {
				// Assert
				expect(vehiculo).toEqual(vehiculoMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/placa/${placa}`);
			expect(req.request.method).toBe('GET');
			req.flush(vehiculoMock);
		});
	});

	describe('create', () => {
		it('debe crear un vehículo correctamente', (done) => {
			// Arrange
			const dto = { placa: 'XYZ789', idTipoVehiculo: 1 };
			const vehiculoMock = { id: 10, ...dto };
			// Act
			service.create(dto).subscribe((vehiculo) => {
				// Assert
				expect(vehiculo).toEqual(vehiculoMock);
				done();
			});
			const req = httpMock.expectOne(apiUrl);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual(dto);
			req.flush(vehiculoMock);
		});
	});

	describe('getById', () => {
		it('debe obtener un vehículo por id', (done) => {
			// Arrange
			const id = 5;
			const vehiculoMock = { id: 5, placa: 'DEF456', idTipoVehiculo: 2 };
			// Act
			service.getById(id).subscribe((vehiculo) => {
				// Assert
				expect(vehiculo).toEqual(vehiculoMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/${id}`);
			expect(req.request.method).toBe('GET');
			req.flush(vehiculoMock);
		});
	});

	describe('getHistorialReservas', () => {
		it('debe obtener el historial de reservas de un vehículo', (done) => {
			// Arrange
			const idVehiculo = 3;
			const reservasMock = [
				{ id: 1, idCelda: 2, idVehiculo: 3, fechaEntrada: '2024-01-01', estado: 'ABIERTA' },
			];
			// Act
			service.getHistorialReservas(idVehiculo).subscribe((reservas) => {
				// Assert
				expect(Array.isArray(reservas)).toBe(true);
				expect(reservas.length).toBe(1);
				expect(reservas[0].idVehiculo).toBe(idVehiculo);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/${idVehiculo}/reservas`);
			expect(req.request.method).toBe('GET');
			req.flush(reservasMock);
		});
	});

	describe('getTiposVehiculo', () => {
		it('debe obtener los tipos de vehículo', (done) => {
			// Arrange
			const tiposMock = [
				{ id: 1, nombre: 'Moto' },
				{ id: 2, nombre: 'Carro' },
			];
			// Act
			service.getTiposVehiculo().subscribe((tipos) => {
				// Assert
				expect(Array.isArray(tipos)).toBe(true);
				expect(tipos.length).toBe(2);
				expect(tipos[0].nombre).toBe('Moto');
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/tipos`);
			expect(req.request.method).toBe('GET');
			req.flush(tiposMock);
		});
	});
});

