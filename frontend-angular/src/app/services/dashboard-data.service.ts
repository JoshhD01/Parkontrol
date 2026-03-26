import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FacturacionCompleta, HistorialReserva, IngresosMensuales, OcupacionParqueadero } from '../models/vistas.model';
import { Reserva } from '../models/reserva.model';
import { ReservasService } from './reservas.service';
import { VistasService } from './vistas.service';

interface AdminDashboardData {
  ocupacion: OcupacionParqueadero[];
  reservasActivas: Reserva[];
  ingresos: IngresosMensuales[];
  facturacion: FacturacionCompleta[];
}

interface OperatorDashboardData {
  ocupacion: OcupacionParqueadero[];
  reservasActivas: Reserva[];
  historial: HistorialReserva[];
}

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  constructor(
    private readonly vistasService: VistasService,
    private readonly reservasService: ReservasService,
  ) {}

  getAdminDashboardData(idEmpresa: number): Observable<AdminDashboardData> {
    return forkJoin({
      ocupacion: this.safeArray(
        this.vistasService.getOcupacion(idEmpresa),
        'no recibe ocupacion',
      ),
      reservasActivas: this.safeArray(
        this.reservasService.getActivas(),
        'No se cargo reservas',
      ),
      ingresos: this.safeArray(
        this.vistasService.getIngresos(idEmpresa),
        'No se cargaron ingresos',
      ),
      facturacion: this.safeArray(
        this.vistasService.getFacturacion(idEmpresa),
        'No cargo facturacion',
      ),
    });
  }

  getOperatorDashboardData(idEmpresa: number): Observable<OperatorDashboardData> {
    return forkJoin({
      ocupacion: this.safeArray(
        this.vistasService.getOcupacion(idEmpresa),
        'no recibe ocupacion',
      ),
      reservasActivas: this.safeArray(
        this.reservasService.getActivas(),
        'No se cargo reservas',
      ),
      historial: this.safeArray(
        this.vistasService.getHistorialReservas(idEmpresa),
        'Error al cargar historial de reservas',
      ),
    });
  }

  private safeArray<T>(source: Observable<T[]>, label: string): Observable<T[]> {
    return source.pipe(
      catchError((error) => {
        console.log(label, error);
        return of([]);
      }),
    );
  }
}
