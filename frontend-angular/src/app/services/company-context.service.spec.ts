import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CompanyContextService } from './company-context.service';
import { AuthService } from './autenticacion.service';
import { ParqueaderosService } from './parqueaderos.service';
import { Parqueadero } from '../models/parqueadero.model';
import { RolUsuario } from '../models/shared.model';

describe('CompanyContextService', () => {
  let service: CompanyContextService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let parqueaderosServiceSpy: jasmine.SpyObj<ParqueaderosService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUsuarioActual']);
    const parqueaderosSpy = jasmine.createSpyObj('ParqueaderosService', ['getByEmpresa']);

    TestBed.configureTestingModule({
      providers: [
        CompanyContextService,
        { provide: AuthService, useValue: authSpy },
        { provide: ParqueaderosService, useValue: parqueaderosSpy },
      ],
    });
    service = TestBed.inject(CompanyContextService);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    parqueaderosServiceSpy = TestBed.inject(ParqueaderosService) as jasmine.SpyObj<ParqueaderosService>;
  });

  describe('getCurrentEmpresaId', () => {
    it('should return idEmpresa if user is authenticated (AAA)', () => {
      // Arrange
      authServiceSpy.getUsuarioActual.and.returnValue({
        id: 1,
        nombre: 'Test User',
        correo: 'test@email.com',
        rol: RolUsuario.ADMINISTRADOR,
        idEmpresa: 42,
      });
      // Act
      const result = service.getCurrentEmpresaId();
      // Assert
      expect(result).toBe(42);
    });

    it('should return null if user is not authenticated (FIRST, AAA)', () => {
      // Arrange
      authServiceSpy.getUsuarioActual.and.returnValue(null);
      // Act
      const result = service.getCurrentEmpresaId();
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getParqueaderosEmpresaActual', () => {
    it('should return parqueaderos for current empresa (AAA)', (done) => {
      // Arrange
      authServiceSpy.getUsuarioActual.and.returnValue({
        id: 2,
        nombre: 'Empresa User',
        correo: 'empresa@email.com',
        rol: RolUsuario.ADMINISTRADOR,
        idEmpresa: 1,
      });
      const parqueaderos: Parqueadero[] = [
        { id: 1, nombre: 'Parqueadero 1', capacidadTotal: 100, ubicacion: 'Centro', idEmpresa: 1 },
      ];
      parqueaderosServiceSpy.getByEmpresa.and.returnValue(of(parqueaderos));
      // Act
      service.getParqueaderosEmpresaActual().subscribe(result => {
        // Assert
        expect(result).toEqual(parqueaderos);
        done();
      });
    });

    it('should return [] if 404 error (FIRST, AAA)', (done) => {
      // Arrange
      authServiceSpy.getUsuarioActual.and.returnValue({
        id: 2,
        nombre: 'Empresa User',
        correo: 'empresa@email.com',
        rol: RolUsuario.ADMINISTRADOR,
        idEmpresa: 1,
      });
      const error = { status: 404 };
      parqueaderosServiceSpy.getByEmpresa.and.returnValue(throwError(() => error));
      // Act
      service.getParqueaderosEmpresaActual().subscribe(result => {
        // Assert
        expect(result).toEqual([]);
        done();
      });
    });

    it('should throw error if not 404 (FIRST, AAA)', (done) => {
      // Arrange
      authServiceSpy.getUsuarioActual.and.returnValue({
        id: 2,
        nombre: 'Empresa User',
        correo: 'empresa@email.com',
        rol: RolUsuario.ADMINISTRADOR,
        idEmpresa: 1,
      });
      const error = { status: 500 };
      parqueaderosServiceSpy.getByEmpresa.and.returnValue(throwError(() => error));
      // Act
      service.getParqueaderosEmpresaActual().subscribe({
        next: () => {},
        error: (err) => {
          // Assert
          expect(err).toBe(error);
          done();
        },
      });
    });

    it('should throw error if no usuario autenticado (FIRST, AAA)', (done) => {
      // Arrange
      authServiceSpy.getUsuarioActual.and.returnValue(null);
      // Act
      service.getParqueaderosEmpresaActual().subscribe({
        next: () => {},
        error: (err) => {
          // Assert
          expect(err).toBeTruthy();
          expect(err.message).toContain('No hay usuario autenticado');
          done();
        },
      });
    });
  });
});
