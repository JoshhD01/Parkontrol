import { TestBed } from '@angular/core/testing';

import { of, throwError } from 'rxjs';
import { DashboardDataService } from './dashboard-data.service';
import { ReservasService } from './reservas.service';
import { VistasService } from './vistas.service';

describe('DashboardDataService', () => {
  let service: DashboardDataService;
  let vistasServiceSpy: jasmine.SpyObj<VistasService>;
  let reservasServiceSpy: jasmine.SpyObj<ReservasService>;

  beforeEach(() => {
    const vistasSpy = jasmine.createSpyObj('VistasService', [
      'getOcupacion',
      'getIngresos',
      'getFacturacion',
      'getHistorialReservas',
    ]);
    const reservasSpy = jasmine.createSpyObj('ReservasService', [
      'getActivas',
    ]);

    TestBed.configureTestingModule({
      providers: [
        DashboardDataService,
        { provide: VistasService, useValue: vistasSpy },
        { provide: ReservasService, useValue: reservasSpy },
      ],
    });
    service = TestBed.inject(DashboardDataService);
    vistasServiceSpy = TestBed.inject(VistasService) as jasmine.SpyObj<VistasService>;
    reservasServiceSpy = TestBed.inject(ReservasService) as jasmine.SpyObj<ReservasService>;
  });

  describe('getAdminDashboardData', () => {
    it('should return admin dashboard data (AAA)', (done) => {
      // Arrange
      const ocupacion = [{
        idParqueadero: 1,
        nombreParqueadero: 'Parqueadero Central',
        nombreEmpresa: 'Empresa X',
        totalCeldas: 100,
        celdasOcupadas: 50,
        celdasLibres: 50,
      }];
      const reservasActivas = [{
        id: 2,
        idCelda: 10,
        idVehiculo: 20,
        fechaEntrada: '2024-01-01T08:00:00Z',
        estado: 'Activa',
        // Opcionales
        monto: 100,
        celda: undefined,
        vehiculo: undefined,
        clienteFactura: undefined,
      }];
      const ingresos = [{
        empresa: 'Empresa X',
        parqueadero: 'Parqueadero Central',
        periodo: '2024-01',
        totalIngresos: 10000,
      }];
      const facturacion = [{
        idFacturaElectronica: 4,
        tipoFactura: 'ELECTRONICA' as 'ELECTRONICA',
        tipoDocumento: 'CC',
        numeroDocumento: '123456789',
        correo: 'test@email.com',
        idPago: 1,
        monto: 10000,
        metodoPago: 'Efectivo',
        fechaPago: '2024-01-01T09:00:00Z',
        enviada: true,
      }];
      vistasServiceSpy.getOcupacion.and.returnValue(of(ocupacion));
      reservasServiceSpy.getActivas.and.returnValue(of(reservasActivas));
      vistasServiceSpy.getIngresos.and.returnValue(of(ingresos));
      vistasServiceSpy.getFacturacion.and.returnValue(of(facturacion));
      // Act
      service.getAdminDashboardData(1).subscribe((result) => {
        // Assert
        expect(result).toEqual({
          ocupacion,
          reservasActivas,
          ingresos,
          facturacion,
        });
        done();
      });
    });

    it('should handle errors and return empty arrays (FIRST, AAA)', (done) => {
      // Arrange
      vistasServiceSpy.getOcupacion.and.returnValue(throwError(() => new Error('fail')));
      reservasServiceSpy.getActivas.and.returnValue(throwError(() => new Error('fail')));
      vistasServiceSpy.getIngresos.and.returnValue(throwError(() => new Error('fail')));
      vistasServiceSpy.getFacturacion.and.returnValue(throwError(() => new Error('fail')));
      // Act
      service.getAdminDashboardData(1).subscribe((result) => {
        // Assert
        expect(result).toEqual({
          ocupacion: [],
          reservasActivas: [],
          ingresos: [],
          facturacion: [],
        });
        done();
      });
    });
  });

  describe('getOperatorDashboardData', () => {
    it('should return operator dashboard data (AAA)', (done) => {
      // Arrange
      const ocupacion = [{
        idParqueadero: 1,
        nombreParqueadero: 'Parqueadero Central',
        nombreEmpresa: 'Empresa X',
        totalCeldas: 100,
        celdasOcupadas: 50,
        celdasLibres: 50,
      }];
      const reservasActivas = [{
        id: 2,
        idCelda: 10,
        idVehiculo: 20,
        fechaEntrada: '2024-01-01T08:00:00Z',
        estado: 'Activa',
        monto: 100,
        celda: undefined,
        vehiculo: undefined,
        clienteFactura: undefined,
      }];
      const historial = [{
        idReserva: 5,
        placa: 'XYZ789',
        tipoVehiculo: 'Moto',
        idCelda: 11,
        parqueadero: 'Parqueadero Central',
        fechaEntrada: '2024-01-02T08:00:00Z',
        fechaSalida: '2024-01-02T10:00:00Z',
        estado: 'Finalizada',
      }];
      vistasServiceSpy.getOcupacion.and.returnValue(of(ocupacion));
      reservasServiceSpy.getActivas.and.returnValue(of(reservasActivas));
      vistasServiceSpy.getHistorialReservas.and.returnValue(of(historial));
      // Act
      service.getOperatorDashboardData(1).subscribe((result) => {
        // Assert
        expect(result).toEqual({
          ocupacion,
          reservasActivas,
          historial,
        });
        done();
      });
    });

    it('should handle errors and return empty arrays (FIRST, AAA)', (done) => {
      // Arrange
      vistasServiceSpy.getOcupacion.and.returnValue(throwError(() => new Error('fail')));
      reservasServiceSpy.getActivas.and.returnValue(throwError(() => new Error('fail')));
      vistasServiceSpy.getHistorialReservas.and.returnValue(throwError(() => new Error('fail')));
      // Act
      service.getOperatorDashboardData(1).subscribe((result) => {
        // Assert
        expect(result).toEqual({
          ocupacion: [],
          reservasActivas: [],
          historial: [],
        });
        done();
      });
    });
  });
});
