import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmpresasService } from './empresas.service';
import { environment } from '../../environments/environment';
import { Empresa } from '../models/shared.model';

describe('EmpresasService', () => {
	let service: EmpresasService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [EmpresasService]
		});
		service = TestBed.inject(EmpresasService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('getById', () => {
		it('debe retornar una empresa por id (AAA, FIRST)', (done) => {
			// Arrange
			const id = 1;
			const mockEmpresa: Empresa = { id: 1, nombre: 'Empresa Demo' };

			// Act
			service.getById(id).subscribe((empresa) => {
				// Assert
				expect(empresa).toEqual(mockEmpresa);
				done();
			});

			const req = httpMock.expectOne(`${environment.urlApi}/companies/${id}`);
			expect(req.request.method).toBe('GET');
			req.flush(mockEmpresa);
		});
	});
});
