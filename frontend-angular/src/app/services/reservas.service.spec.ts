import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReservasService } from './reservas.service';
import { environment } from '../../environments/environment';

describe('ReservasService', () => {
	let service: ReservasService;
	let httpMock: HttpTestingController;
	const apiUrl = `${environment.urlApi}/reservations`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [ReservasService],
		});
		service = TestBed.inject(ReservasService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('getByParqueadero', () => {
		it('debe obtener reservas por idParqueadero', (done) => {
			// Arrange
			const idParqueadero = 1;
			const reservasMock = [
				{ id: 1, idCelda: 2, idVehiculo: 3, fechaEntrada: '2024-01-01', estado: 'ABIERTA' },
			];
			// Act
			service.getByParqueadero(idParqueadero).subscribe((reservas) => {
				// Assert
				expect(Array.isArray(reservas)).toBe(true);
				expect(reservas.length).toBe(1);
				expect(reservas[0].idCelda).toBe(2);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/parqueadero/${idParqueadero}`);
			expect(req.request.method).toBe('GET');
			req.flush(reservasMock);
		});
	});

	describe('create', () => {
		it('debe crear una reserva correctamente', (done) => {
			// Arrange
			const dto = { idVehiculo: 3, idCelda: 2, estado: 'ABIERTA', horaInicio: '10:00', horaFin: '12:00' };
			const reservaMock = { id: 10, ...dto, fechaEntrada: '2024-01-01' };
			// Act
			service.create(dto).subscribe((reserva) => {
				// Assert
				expect(reserva).toEqual(reservaMock);
				done();
			});
			const req = httpMock.expectOne(apiUrl);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual(dto);
			req.flush(reservaMock);
		});
	});

	describe('finalizar', () => {
		it('debe finalizar una reserva correctamente', (done) => {
			// Arrange
			const idReserva = 5;
			const reservaMock = { id: 5, idCelda: 2, idVehiculo: 3, fechaEntrada: '2024-01-01', estado: 'CERRADA' };
			// Act
			service.finalizar(idReserva).subscribe((reserva) => {
				// Assert
				expect(reserva.estado).toBe('CERRADA');
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/${idReserva}/finalizar`);
			expect(req.request.method).toBe('PATCH');
			expect(req.request.body).toEqual({});
			req.flush(reservaMock);
		});
	});

	describe('getActivas', () => {
		it('debe obtener reservas activas', (done) => {
			// Arrange
			const reservasMock = [
				{ id: 1, idCelda: 2, idVehiculo: 3, fechaEntrada: '2024-01-01', estado: 'ABIERTA' },
			];
			// Act
			service.getActivas().subscribe((reservas) => {
				// Assert
				expect(Array.isArray(reservas)).toBe(true);
				expect(reservas[0].estado).toBe('ABIERTA');
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/activas`);
			expect(req.request.method).toBe('GET');
			req.flush(reservasMock);
		});
	});

	describe('getMisReservasCliente', () => {
		it('debe obtener las reservas del cliente actual', (done) => {
			// Arrange
			const reservasMock = [
				{ id: 1, idCelda: 2, idVehiculo: 3, fechaEntrada: '2024-01-01', estado: 'ABIERTA' },
			];
			// Act
			service.getMisReservasCliente().subscribe((reservas) => {
				// Assert
				expect(Array.isArray(reservas)).toBe(true);
				expect(reservas.length).toBe(1);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/client/mias`);
			expect(req.request.method).toBe('GET');
			req.flush(reservasMock);
		});
	});

	describe('getMisVehiculosCliente', () => {
		it('debe obtener los vehículos del cliente actual', (done) => {
			// Arrange
			const vehiculosMock = [
				{ id: 1, placa: 'ABC123', idTipoVehiculo: 1 },
			];
			// Act
			service.getMisVehiculosCliente().subscribe((vehiculos) => {
				// Assert
				expect(Array.isArray(vehiculos)).toBe(true);
				expect(vehiculos[0].placa).toBe('ABC123');
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/client/vehiculos`);
			expect(req.request.method).toBe('GET');
			req.flush(vehiculosMock);
		});
	});

	describe('crearComoCliente', () => {
		it('debe crear una reserva como cliente', (done) => {
			// Arrange
			const dto = { idParqueadero: 1, placa: 'XYZ789', idTipoVehiculo: 1 as 1, horaInicio: '09:00', horaFin: '11:00' };
			const reservaMock = { id: 20, idCelda: 2, idVehiculo: 3, fechaEntrada: '2024-01-01', estado: 'ABIERTA' };
			// Act
			service.crearComoCliente(dto).subscribe((reserva) => {
				// Assert
				expect(reserva).toEqual(reservaMock);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/client`);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual(dto);
			req.flush(reservaMock);
		});
	});
});
