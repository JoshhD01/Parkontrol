import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PagosService } from './pagos.service';
import { environment } from '../../environments/environment';
import { Pago, CrearPagoDto } from '../models/pago.model';

describe('PagosService', () => {
	let service: PagosService;
	let httpMock: HttpTestingController;
	const apiUrl = environment.urlApi;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [PagosService],
		});
		service = TestBed.inject(PagosService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('create', () => {
		it('debe crear un pago correctamente (AAA, FIRST)', (done) => {
			// Arrange
			const dto: CrearPagoDto = { idReserva: 1, idMetodoPago: 2 };
			const pagoMock: Pago = {
				id: 10,
				idReserva: 1,
				idMetodoPago: 2,
				monto: 1000,
				fechaPago: '2024-01-01',
			};
			// Act
			service.create(dto).subscribe((pago) => {
				// Assert
				expect(pago).toEqual(pagoMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/payments`);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual(dto);
			req.flush(pagoMock);
		});
	});

	describe('getById', () => {
		it('debe obtener un pago por id', (done) => {
			// Arrange
			const id = 5;
			const pagoMock: Pago = {
				id: 5,
				idReserva: 2,
				idMetodoPago: 1,
				monto: 500,
				fechaPago: '2024-01-02',
			};
			// Act
			service.getById(id).subscribe((pago) => {
				// Assert
				expect(pago).toEqual(pagoMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/payments/${id}`);
			expect(req.request.method).toBe('GET');
			req.flush(pagoMock);
		});
	});

	describe('getByReserva', () => {
		it('debe obtener un pago por idReserva', (done) => {
			// Arrange
			const idReserva = 7;
			const pagoMock: Pago = {
				id: 8,
				idReserva: 7,
				idMetodoPago: 2,
				monto: 200,
				fechaPago: '2024-01-03',
			};
			// Act
			service.getByReserva(idReserva).subscribe((pago) => {
				// Assert
				expect(pago.idReserva).toBe(idReserva);
				expect(pago).toEqual(pagoMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/payments/reserva/${idReserva}`);
			expect(req.request.method).toBe('GET');
			req.flush(pagoMock);
		});
	});

	describe('getByParqueadero', () => {
		it('debe obtener pagos por idParqueadero', (done) => {
			// Arrange
			const idParqueadero = 3;
			const pagosMock: Pago[] = [
				{ id: 1, idReserva: 1, idMetodoPago: 1, monto: 100, fechaPago: '2024-01-01' },
				{ id: 2, idReserva: 2, idMetodoPago: 2, monto: 200, fechaPago: '2024-01-02' },
			];
			// Act
			service.getByParqueadero(idParqueadero).subscribe((pagos) => {
				// Assert
				expect(Array.isArray(pagos)).toBe(true);
				expect(pagos.length).toBe(2);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/payments/parqueadero/${idParqueadero}`);
			expect(req.request.method).toBe('GET');
			req.flush(pagosMock);
		});
	});

	describe('getMisPagos', () => {
		it('debe obtener los pagos del cliente actual', (done) => {
			// Arrange
			const pagosMock: Pago[] = [
				{ id: 1, idReserva: 1, idMetodoPago: 1, monto: 100, fechaPago: '2024-01-01' },
			];
			// Act
			service.getMisPagos().subscribe((pagos) => {
				// Assert
				expect(Array.isArray(pagos)).toBe(true);
				expect(pagos.length).toBe(1);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/payments/client/mis-pagos`);
			expect(req.request.method).toBe('GET');
			req.flush(pagosMock);
		});
	});
});

