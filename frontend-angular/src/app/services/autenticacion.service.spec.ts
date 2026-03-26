import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './autenticacion.service';
import { environment } from '../../environments/environment';
import { RegistrarClienteDto, RegistroClienteResponse, LoginUsuarioDto, LoginResponseDto, Usuario } from '../models/usuario.model';
import { RolUsuario } from '../models/shared.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.urlApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a client and return response', (done) => {
      // Arrange
      const dto: RegistrarClienteDto = {
        tipoDocumento: 'CC',
        numeroDocumento: '12345678',
        correo: 'juan@mail.com',
        contrasena: '123',
      };
      const response: RegistroClienteResponse = {
        idClienteFactura: 1,
        correo: 'juan@mail.com',
      };
      // Act
      service.register(dto).subscribe(res => {
        // Assert
        expect(res).toEqual(response);
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/auth/register-client`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(response);
    });
  });

  describe('login', () => {
    it('should login and store token', (done) => {
      // Arrange
      const dto: LoginUsuarioDto = { correo: 'juan@mail.com', contrasena: '123', tipoAcceso: 'CLIENTE' };
      const response: LoginResponseDto = { access_token: 'token123' };
      // Act
      service.login(dto).subscribe(res => {
        // Assert
        expect(res).toEqual(response);
        expect(localStorage.getItem('auth_token')).toBe('token123');
        done();
      });
      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ...dto, tipoAcceso: 'CLIENTE' });
      req.flush(response);
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage', () => {
      // Arrange
      localStorage.setItem('auth_token', 'token123');
      // Act
      service.logout();
      // Assert
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      // Arrange
      localStorage.setItem('auth_token', 'token123');
      // Act
      const token = service.getToken();
      // Assert
      expect(token).toBe('token123');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if no token', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('tieneRole', () => {
    it('should return true if user has role', () => {
      spyOn(service, 'getUsuarioActual').and.returnValue({ id: 1, nombre: 'Juan', correo: 'juan@mail.com', rol: RolUsuario.ADMINISTRADOR, idEmpresa: 1 } as Usuario);
      expect(service.tieneRole(RolUsuario.ADMINISTRADOR)).toBeTrue();
    });
    it('should return false if user does not have role', () => {
      spyOn(service, 'getUsuarioActual').and.returnValue({ id: 1, nombre: 'Juan', correo: 'juan@mail.com', rol: RolUsuario.OPERADOR, idEmpresa: 1 } as Usuario);
      expect(service.tieneRole(RolUsuario.ADMINISTRADOR)).toBeFalse();
    });
  });

  describe('isAdministrador', () => {
    it('should return true if user is ADMINISTRADOR', () => {
      spyOn(service, 'tieneRole').and.returnValue(true);
      expect(service.isAdministrador()).toBeTrue();
    });
  });

  describe('isOperador', () => {
    it('should return true if user is OPERADOR', () => {
      spyOn(service, 'tieneRole').and.returnValue(true);
      expect(service.isOperador()).toBeTrue();
    });
  });

  describe('isCliente', () => {
    it('should return true if user is CLIENTE', () => {
      spyOn(service, 'tieneRole').and.returnValue(true);
      expect(service.isCliente()).toBeTrue();
    });
  });
});
