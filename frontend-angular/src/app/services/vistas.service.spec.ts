import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VistasService } from './vistas.service';
import { environment } from '../../environments/environment';

describe('VistasService', () => {
	let service: VistasService;
	let httpMock: HttpTestingController;
	const apiUrl = environment.urlApi;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [VistasService],
		});
		service = TestBed.inject(VistasService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('getOcupacion', () => {
		it('debe obtener ocupación de parqueaderos sin idEmpresa', (done) => {
			// Arrange
			const ocupacionMock = [
				{ idParqueadero: 1, nombreParqueadero: 'Central', nombreEmpresa: 'Empresa1', totalCeldas: 100, celdasOcupadas: 50, celdasLibres: 50 },
			];
			// Act
			service.getOcupacion().subscribe((data) => {
				// Assert
				expect(Array.isArray(data)).toBe(true);
				expect(data[0].nombreParqueadero).toBe('Central');
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/views/ocupacion`);
			expect(req.request.method).toBe('GET');
			req.flush(ocupacionMock);
		});

		it('debe obtener ocupación de parqueaderos con idEmpresa', (done) => {
			// Arrange
			const idEmpresa = 2;
			const ocupacionMock = [
				{ idParqueadero: 2, nombreParqueadero: 'Norte', nombreEmpresa: 'Empresa2', totalCeldas: 80, celdasOcupadas: 30, celdasLibres: 50 },
			];
			// Act
			service.getOcupacion(idEmpresa).subscribe((data) => {
				// Assert
				expect(data[0].idParqueadero).toBe(2);
				expect(data[0].nombreEmpresa).toBe('Empresa2');
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/views/ocupacion?idEmpresa=${idEmpresa}`);
			expect(req.request.method).toBe('GET');
			req.flush(ocupacionMock);
		});
	});

	describe('getHistorialReservas', () => {
		it('debe obtener historial de reservas', (done) => {
			// Arrange
			const historialMock = [
				{ idReserva: 1, placa: 'ABC123', tipoVehiculo: 'Carro', idCelda: 2, parqueadero: 'Central', fechaEntrada: '2024-01-01', estado: 'ABIERTA' },
			];
			// Act
			service.getHistorialReservas().subscribe((data) => {
				// Assert
				expect(Array.isArray(data)).toBe(true);
				expect(data[0].placa).toBe('ABC123');
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/views/historial-reservas`);
			expect(req.request.method).toBe('GET');
			req.flush(historialMock);
		});
	});

	describe('getFacturacion', () => {
		it('debe obtener facturación y mapear tipoFactura y enviada', (done) => {
			// Arrange
			const facturacionRaw = [
				{ idFacturaElectronica: 1, tipoDocumento: 'CC', numeroDocumento: '123', correo: 'a@test.com', idPago: 1, monto: 1000, metodoPago: 'Efectivo', fechaPago: '2024-01-01', cufe: 'NF-123', enviada: 'Y' },
				{ idFacturaElectronica: 2, tipoDocumento: 'CC', numeroDocumento: '456', correo: 'b@test.com', idPago: 2, monto: 2000, metodoPago: 'Tarjeta', fechaPago: '2024-01-02', enviada: 1 },
			];
			// Act
			service.getFacturacion().subscribe((data) => {
				// Assert
				expect(Array.isArray(data)).toBe(true);
				expect(data[0].tipoFactura).toBe('NORMAL');
				expect(data[1].enviada).toBe(true);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/views/facturacion`);
			expect(req.request.method).toBe('GET');
			req.flush(facturacionRaw);
		});
	});

	describe('getIngresos', () => {
		it('debe obtener ingresos mensuales', (done) => {
			// Arrange
			const ingresosMock = [
				{ empresa: 'Empresa1', parqueadero: 'Central', periodo: '2024-01', totalIngresos: 5000 },
			];
			// Act
			service.getIngresos().subscribe((data) => {
				// Assert
				expect(Array.isArray(data)).toBe(true);
				expect(data[0].totalIngresos).toBe(5000);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/views/ingresos`);
			expect(req.request.method).toBe('GET');
			req.flush(ingresosMock);
		});
	});
});
