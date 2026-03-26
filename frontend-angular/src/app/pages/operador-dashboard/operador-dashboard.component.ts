import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../services/autenticacion.service';
import { EmpresasService } from '../../services/empresas.service';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { OcupacionParqueadero, HistorialReserva } from '../../models/vistas.model';
import { Reserva } from '../../models/reserva.model';
import { Empresa } from '../../models/shared.model';
import { HistorialReservasComponent } from '../../components/historial-reservas/historial-reservas.component';
import { ReservasActivasComponent } from '../../components/reservas-activas/reservas-activas.component';
import { DashboardStatCard, DashboardStatsComponent } from '../../components/dashboard-stats/dashboard-stats.component';

@Component({
  selector: 'app-operador-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HistorialReservasComponent,
    ReservasActivasComponent,
    DashboardStatsComponent,
  ],
  templateUrl: './operador-dashboard.component.html',
  styleUrls: ['./operador-dashboard.component.scss'],
})
export class OperadorDashboardComponent implements OnInit {
  ocupacion: OcupacionParqueadero[] = [];
  reservasActivas: Reserva[] = [];
  empresaUsuario: Empresa | null = null;
  historial: HistorialReserva[] = [];

  loading = true;
  totalParqueaderos = 0;
  totalCeldasOcupadas = 0;
  totalCeldasDisponibles = 0;
  totalReservasActivas = 0;

  mostrarReservasActivas = false;

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

  constructor(
    private readonly authService: AuthService,
    private readonly empresasService: EmpresasService,
    private readonly dashboardDataService: DashboardDataService,
    private readonly router: Router,
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
      },
    });

    this.cargarDatosDashboard(usuario.idEmpresa);
  }

  private cargarDatosDashboard(idEmpresa: number): void {
    this.loading = true;
    this.dashboardDataService.getOperatorDashboardData(idEmpresa).subscribe({
      next: (data) => {
        this.ocupacion = data.ocupacion;
        this.reservasActivas = data.reservasActivas;
        this.historial = data.historial;
      },
      complete: () => {
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: () => {
        this.ocupacion = [];
        this.reservasActivas = [];
        this.historial = [];
        this.calcularEstadisticas();
        this.loading = false;
      },
    });
  }

  private calcularEstadisticas(): void {
    this.totalParqueaderos = this.ocupacion.length;
    this.totalReservasActivas = this.reservasActivas.length;
    this.totalCeldasOcupadas = this.ocupacion.reduce(
      (total, parqueadero) => total + this.toNumber(parqueadero.celdasOcupadas),
      0,
    );
    this.totalCeldasDisponibles = this.ocupacion.reduce(
      (total, parqueadero) => total + this.toNumber(parqueadero.celdasLibres),
      0,
    );
  }

  private toNumber(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  verCeldas(): void {
    this.router.navigate(['celdas']);
  }

  registrarVehiculo(): void {
    this.router.navigate(['vehiculos']);
  }

  cambioReservas(): void {
    this.mostrarReservasActivas = !this.mostrarReservasActivas;
  }
}