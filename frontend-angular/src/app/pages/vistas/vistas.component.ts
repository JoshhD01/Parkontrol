import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/autenticacion.service';
import { VistasService } from '../../services/vistas.service';
import { OcupacionParqueadero, HistorialReserva, FacturacionCompleta, IngresosMensuales } from '../../models/vistas.model';
import { OcupacionParqueaderosComponent } from '../../components/ocupacion-parqueaderos/ocupacion-parqueaderos.component';
import { HistorialReservasComponent } from '../../components/historial-reservas/historial-reservas.component';
import { IngresosMensualesComponent } from '../../components/ingresos-mensuales/ingresos-mensuales.component';
import { FacturacionCompletaComponent } from '../../components/facturacion-completa/facturacion-completa.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-vistas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    OcupacionParqueaderosComponent,
    HistorialReservasComponent,
    IngresosMensualesComponent,
    FacturacionCompletaComponent
  ],
  templateUrl: './vistas.component.html',
  styleUrls: ['./vistas.component.scss']
})
export class VistasComponent implements OnInit {
  ocupacion: OcupacionParqueadero[] = [];
  historial: HistorialReserva[] = [];
  ingresos: IngresosMensuales[] = [];
  facturacion: FacturacionCompleta[] = [];
  
  loading = false;
  idEmpresa: number | null = null;

  ingresosTotal = 0;
  facturacionTotal = 0;
  totalReservas = 0;
  promedioOcupacion = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly vistasService: VistasService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario?.idEmpresa) {
      console.error('No hay usuario autenticado');
      this.loading = false;
      return;
    }

    this.idEmpresa = usuario.idEmpresa;
    this.cargarDatosVistas(this.idEmpresa);
  }

  private cargarDatosVistas(idEmpresa: number): void {
    this.loading = true;
    forkJoin({
      ocupacion: this.vistasService.getOcupacion(idEmpresa).pipe(
        catchError((error) => {
          console.log('No cargo ocupacion', error);
          return of([] as OcupacionParqueadero[]);
        }),
      ),
      historial: this.vistasService.getHistorialReservas(idEmpresa).pipe(
        catchError((error) => {
          console.log('Error no cargo historial de reservas', error);
          return of([] as HistorialReserva[]);
        }),
      ),
      ingresos: this.vistasService.getIngresos(idEmpresa).pipe(
        catchError((error) => {
          console.log('No cargo ingresos', error);
          return of([] as IngresosMensuales[]);
        }),
      ),
      facturacion: this.vistasService.getFacturacion(idEmpresa).pipe(
        catchError((error) => {
          console.log('No cargo facturacion', error);
          return of([] as FacturacionCompleta[]);
        }),
      ),
    })
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (data) => {
          this.ocupacion = data.ocupacion;
          this.historial = data.historial;
          this.ingresos = data.ingresos;
          this.facturacion = data.facturacion;
          this.calcularEstadisticas();
        },
      });
  }

  private calcularEstadisticas(): void {

    this.totalReservas = this.historial.length;
    this.ingresosTotal = this.ingresos.reduce(
      (total, ingreso) => total + this.toNumber(ingreso.totalIngresos),
      0,
    );
    this.facturacionTotal = this.facturacion.reduce(
      (total, parqueadero) => total + this.toNumber(parqueadero.monto),
      0,
    );
    

    if (this.ocupacion.length > 0) {
      let sumaPromedios = 0;
      for (const parqueadero of this.ocupacion) {
        const totalCeldas = this.toNumber(parqueadero.totalCeldas);
        const celdasOcupadas = this.toNumber(parqueadero.celdasOcupadas);
        const porcentaje = totalCeldas > 0
          ? (celdasOcupadas / totalCeldas * 100)
          : 0;
        sumaPromedios += porcentaje;
      }
      this.promedioOcupacion = sumaPromedios / this.ocupacion.length;
    } else {
      this.promedioOcupacion = 0;
    }
  }

  private toNumber(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
}