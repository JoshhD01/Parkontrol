import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/autenticacion.service';
import { EmpresasService } from '../../services/empresas.service';
import { OcupacionParqueadero, IngresosMensuales, FacturacionCompleta } from '../../models/vistas.model';
import { Reserva } from '../../models/reserva.model';
import { Empresa } from '../../models/shared.model';
import { OcupacionParqueaderosComponent } from '../../components/ocupacion-parqueaderos/ocupacion-parqueaderos.component';
import { DashboardStatCard, DashboardStatsComponent } from '../../components/dashboard-stats/dashboard-stats.component';
import { DashboardDataService } from '../../services/dashboard-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    OcupacionParqueaderosComponent,
    DashboardStatsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  ocupacion: OcupacionParqueadero[] = [];
  reservasActivas: Reserva[] = [];
  ingresos: IngresosMensuales[] = [];
  facturacion: FacturacionCompleta[] = [];
  empresaUsuario: Empresa | null = null;

  loading = true;
  totalParqueaderos = 0;
  totalCeldasOcupadas = 0;
  totalCeldasDisponibles = 0;
  totalReservasActivas = 0;
  ingresosTotal = 0;
  totalFacturas = 0;
  promedioOcupacion = 0;

  get mainCards(): DashboardStatCard[] {
    return [
      {
        icon: 'business',
        iconClass: 'parqueaderos',
        value: this.totalParqueaderos,
        label: 'Parqueaderos Activos',
      },
      {
        icon: 'directions_car',
        iconClass: 'ocupadas',
        value: this.totalCeldasOcupadas,
        label: 'Celdas Ocupadas',
      },
      {
        icon: 'local_parking',
        iconClass: 'disponibles',
        value: this.totalCeldasDisponibles,
        label: 'Celdas Disponibles',
      },
      {
        icon: 'schedule',
        iconClass: 'reservas',
        value: this.totalReservasActivas,
        label: 'Reservas Activas',
      },
    ];
  }

  get secondaryCards(): DashboardStatCard[] {
    return [
      {
        icon: '',
        iconClass: '',
        value: '$' + this.ingresosTotal.toLocaleString('es-CO', { maximumFractionDigits: 2 }),
        label: 'Total Ingresos',
      },
      {
        icon: '',
        iconClass: '',
        value: this.totalFacturas,
        label: 'Total Facturas',
      },
      {
        icon: '',
        iconClass: '',
        value: this.promedioOcupacion.toFixed(2) + '%',
        label: 'Promedio Ocupacion',
      },
    ];
  }

  constructor(
    private readonly authService: AuthService,
    private readonly empresasService: EmpresasService,
    private readonly dashboardDataService: DashboardDataService,
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  private cargarDashboard(): void {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      console.error('No hay usuario autenticado');
      this.loading = false;
      return;
    }

    this.empresasService.getById(usuario.idEmpresa).subscribe({
      next: (empresa) => {
        this.empresaUsuario = empresa;
      },
      error: (error) => {
        console.error('Error cargando empresa', error);
        this.loading = false;
      }
    });

    this.cargarDatosDashboard(usuario.idEmpresa);
  }

  private cargarDatosDashboard(idEmpresa: number): void {
    this.loading = true;
    this.dashboardDataService.getAdminDashboardData(idEmpresa).subscribe({
      next: (data) => {
        this.ocupacion = data.ocupacion;
        this.reservasActivas = data.reservasActivas;
        this.ingresos = data.ingresos;
        this.facturacion = data.facturacion;
      },
      complete: () => {
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: () => {
        this.ocupacion = [];
        this.reservasActivas = [];
        this.ingresos = [];
        this.facturacion = [];
        this.calcularEstadisticas();
        this.loading = false;
      },
    });
  }

  private calcularEstadisticas(): void {
    this.totalParqueaderos = this.ocupacion.length;
    this.totalReservasActivas = this.reservasActivas.length;
    this.totalFacturas = this.facturacion.length;
    this.totalCeldasOcupadas = this.ocupacion.reduce(
      (total, parqueadero) => total + this.toNumber(parqueadero.celdasOcupadas),
      0,
    );
    this.totalCeldasDisponibles = this.ocupacion.reduce(
      (total, parqueadero) => total + this.toNumber(parqueadero.celdasLibres),
      0,
    );
    this.ingresosTotal = this.ingresos.reduce(
      (total, ingreso) => total + this.toNumber(ingreso.totalIngresos),
      0,
    );

    if (this.ocupacion.length > 0) {
      let sumaPromedios = 0;
      for (const parqueadero of this.ocupacion) {
        const totalCeldas = this.toNumber(parqueadero.totalCeldas);
        const celdasOcupadas = this.toNumber(parqueadero.celdasOcupadas);
        const porcentaje =
          totalCeldas > 0
            ? (celdasOcupadas / totalCeldas) * 100
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