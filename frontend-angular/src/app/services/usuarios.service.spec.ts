import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuariosService } from './usuarios.service';
import { environment } from '../../environments/environment';

describe('UsuariosService', () => {
	let service: UsuariosService;
	let httpMock: HttpTestingController;
	const apiUrl = `${environment.urlApi}/users`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [UsuariosService],
		});
		service = TestBed.inject(UsuariosService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('getByEmpresa', () => {
		it('debe obtener usuarios por idEmpresa', (done) => {
			// Arrange
			const idEmpresa = 1;
			const usuariosMock = [
				{ id: 1, nombre: 'Ana', correo: 'ana@test.com', rol: 'ADMINISTRADOR' as any, idEmpresa: 1 },
				{ id: 2, nombre: 'Luis', correo: 'luis@test.com', rol: 'OPERADOR' as any, idEmpresa: 1 },
			];
			// Act
			service.getByEmpresa(idEmpresa).subscribe((usuarios) => {
				// Assert
				expect(Array.isArray(usuarios)).toBe(true);
				expect(usuarios.length).toBe(2);
				expect(usuarios[0].idEmpresa).toBe(idEmpresa);
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/empresa/${idEmpresa}`);
			expect(req.request.method).toBe('GET');
			req.flush(usuariosMock);
		});
	});

	describe('create', () => {
		it('debe crear un usuario correctamente', (done) => {
			// Arrange
			const dto = { nombre: 'Juan', correo: 'juan@test.com', contrasena: '1234', rol: 'ADMINISTRADOR', idEmpresa: 2 };
			const usuarioMock = { id: 10, nombre: 'Juan', correo: 'juan@test.com', rol: 'ADMINISTRADOR' as any, idEmpresa: 2 };
			// Act
			service.create(dto).subscribe((usuario) => {
				// Assert
				expect(usuario).toEqual(usuarioMock);
				done();
			});
			const req = httpMock.expectOne(apiUrl);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual(dto);
			req.flush(usuarioMock);
		});
	});

	describe('delete', () => {
		it('debe eliminar un usuario por id', (done) => {
			// Arrange
			const id = 5;
			// Act
			service.delete(id).subscribe((resp) => {
				// Assert
				expect(resp).toBeNull();
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/${id}`);
			expect(req.request.method).toBe('DELETE');
			req.flush(null);
		});
	});

	describe('cambiarContrasena', () => {
		it('debe cambiar la contraseña correctamente', (done) => {
			// Arrange
			const data = { contrasenaActual: 'old', nuevaContrasena: 'new' };
			const respMock = { mensaje: 'Contraseña actualizada' };
			// Act
			service.cambiarContrasena(data).subscribe((resp) => {
				// Assert
				expect(resp.mensaje).toBe('Contraseña actualizada');
				done();
			});
			const req = httpMock.expectOne(`${apiUrl}/cambiar-contrasena`);
			expect(req.request.method).toBe('PATCH');
			expect(req.request.body).toEqual(data);
			req.flush(respMock);
		});
	});
});

