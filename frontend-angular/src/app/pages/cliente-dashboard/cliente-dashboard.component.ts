import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/autenticacion.service';
import { ParqueaderosService } from '../../services/parqueaderos.service';
import { ReservasService } from '../../services/reservas.service';
import { FacturacionService } from '../../services/facturacion.service';
import { Parqueadero } from '../../models/parqueadero.model';
import { Reserva } from '../../models/reserva.model';
import { FacturaElectronica } from '../../models/facturacion.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.scss'],
})
export class ClienteDashboardComponent {
  parqueaderos: Parqueadero[] = [];
  vehiculosCliente: Vehiculo[] = [];
  reservas: Reserva[] = [];
  facturas: FacturaElectronica[] = [];
  loading = false;
  errorMessage = '';
  private autoRefreshSub?: Subscription;

  nuevaReserva = {
    idParqueadero: 0,
    placa: '',
    idTipoVehiculo: 1 as 1 | 2,
  };
  usarVehiculoExistente = true;
  idVehiculoSeleccionado = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly parqueaderosService: ParqueaderosService,
    private readonly reservasService: ReservasService,
    private readonly facturacionService: FacturacionService,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.iniciarAutoRefresh();
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
  }

  get correoCliente(): string {
    return this.authService.getUsuarioActual()?.correo ?? '';
  }

  get totalReservas(): number {
    return this.reservas.length;
  }

  get totalFacturas(): number {
    return this.facturas.length;
  }

  get totalVehiculos(): number {
    return this.vehiculosCliente.length;
  }

  formatearTipoVehiculo(vehiculo: Vehiculo): string {
    const nombreTipo = String(vehiculo.tipoVehiculo?.nombre ?? '').trim();
    if (nombreTipo.length > 0) {
      return nombreTipo;
    }

    const idTipoVehiculo = this.obtenerIdTipoVehiculo(vehiculo);
    if (idTipoVehiculo === 1) return 'Particular';
    if (idTipoVehiculo === 2) return 'Moto';
    if (idTipoVehiculo === 3) return 'Camioneta';
    return 'Tipo no definido';
  }

  private obtenerIdTipoVehiculo(vehiculo: Vehiculo): number {
    const idDirecto = Number((vehiculo as any).idTipoVehiculo);
    if (Number.isFinite(idDirecto) && idDirecto > 0) {
      return idDirecto;
    }

    const idRelacion = Number((vehiculo as any).tipoVehiculo?.id);
    if (Number.isFinite(idRelacion) && idRelacion > 0) {
      return idRelacion;
    }

    return 0;
  }

  obtenerEstadoReserva(estado: string): string {
    return estado === 'ABIERTA' ? 'Activa' : 'Finalizada';
  }

  cargarDatos(mostrarLoading = true): void {
    if (mostrarLoading) {
      this.loading = true;
    }
    this.errorMessage = '';

    this.parqueaderosService.getDisponiblesCliente().subscribe({
      next: (data) => {
        this.parqueaderos = data;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los parqueaderos disponibles';
      },
    });

    this.reservasService.getMisReservasCliente().subscribe({
      next: (data) => {
        this.reservas = data;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar tus reservas';
      },
    });

    this.reservasService.getMisVehiculosCliente().subscribe({
      next: (data) => {
        this.vehiculosCliente = data.map((vehiculo) => ({
          ...vehiculo,
          idTipoVehiculo: this.obtenerIdTipoVehiculo(vehiculo),
        }));
        if (!data.length) {
          this.usarVehiculoExistente = false;
        }
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar tus vehículos';
      },
    });

    this.facturacionService.getMisFacturasCliente().subscribe({
      next: (data) => {
        this.facturas = data;
        if (mostrarLoading) {
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar tus facturas';
        if (mostrarLoading) {
          this.loading = false;
        }
      },
    });
  }

  private iniciarAutoRefresh(): void {
    this.autoRefreshSub?.unsubscribe();
    this.autoRefreshSub = interval(10000).subscribe(() => {
      this.cargarDatos(false);
    });
  }

  crearReserva(): void {
    if (!this.nuevaReserva.idParqueadero) {
      this.errorMessage = 'Debes seleccionar un parqueadero';
      return;
    }

    let payload = { ...this.nuevaReserva };

    if (this.usarVehiculoExistente) {
      const vehiculo = this.vehiculosCliente.find(
        (item) => item.id === this.idVehiculoSeleccionado,
      );
      if (!vehiculo) {
        this.errorMessage = 'Debes seleccionar un vehículo existente';
        return;
      }

      payload = {
        ...payload,
        placa: vehiculo.placa,
        idTipoVehiculo: vehiculo.idTipoVehiculo as 1 | 2,
      };
    } else if (!this.nuevaReserva.placa.trim()) {
      this.errorMessage = 'Debes ingresar una placa';
      return;
    }

    this.reservasService.crearComoCliente(payload).subscribe({
      next: () => {
        this.nuevaReserva = {
          idParqueadero: 0,
          placa: '',
          idTipoVehiculo: 1,
        };
        this.idVehiculoSeleccionado = 0;
        this.cargarDatos();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message ?? 'No fue posible crear la reserva';
      },
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
