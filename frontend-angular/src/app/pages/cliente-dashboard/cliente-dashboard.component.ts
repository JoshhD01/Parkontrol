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
import { UsuariosService } from '../../services/usuarios.service';
import { PagosService } from '../../services/pagos.service';
import { Parqueadero } from '../../models/parqueadero.model';
import { Reserva } from '../../models/reserva.model';
import { FacturaElectronica } from '../../models/facturacion.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { Pago } from '../../models/pago.model';
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
  misPagos: Pago[] = [];
  loading = false;
  errorMessage = '';
  private autoRefreshSub?: Subscription;

  // Password change
  mostrarCambioContrasena = false;
  contrasenaActual = '';
  nuevaContrasena = '';
  hideContrasenaActual = true;
  hideNuevaContrasena = true;
  mensajeContrasena = '';
  errorContrasena = '';

  nuevaReserva = {
    idParqueadero: 0,
    placa: '',
    idTipoVehiculo: 1 as 1 | 2,
    horaInicio: '',
    horaFin: '',
  };
  usarVehiculoExistente = true;
  idVehiculoSeleccionado = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly parqueaderosService: ParqueaderosService,
    private readonly reservasService: ReservasService,
    private readonly facturacionService: FacturacionService,
    private readonly usuariosService: UsuariosService,
    private readonly pagosService: PagosService,
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

    this.pagosService.getMisPagos().subscribe({
      next: (data) => {
        this.misPagos = data;
      },
      error: () => {
        this.misPagos = [];
      },
    });
  }

  private iniciarAutoRefresh(): void {
    this.autoRefreshSub?.unsubscribe();
    this.autoRefreshSub = interval(10000).subscribe(() => {
      this.cargarDatos(false);
    });
  }

  private convertirAISO(valor: string): string | null {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return null;
    }
    return fecha.toISOString();
  }

  crearReserva(): void {
    if (!this.nuevaReserva.idParqueadero) {
      this.errorMessage = 'Debes seleccionar un parqueadero';
      return;
    }

    if (!this.nuevaReserva.horaInicio || !this.nuevaReserva.horaFin) {
      this.errorMessage = 'Debes ingresar hora de inicio y hora de fin';
      return;
    }

    if (
      new Date(this.nuevaReserva.horaFin).getTime() <=
      new Date(this.nuevaReserva.horaInicio).getTime()
    ) {
      this.errorMessage = 'La hora de fin debe ser mayor a la hora de inicio';
      return;
    }

    const horaInicioISO = this.convertirAISO(this.nuevaReserva.horaInicio);
    const horaFinISO = this.convertirAISO(this.nuevaReserva.horaFin);

    if (!horaInicioISO || !horaFinISO) {
      this.errorMessage = 'El formato de hora no es válido';
      return;
    }

    let payload = {
      ...this.nuevaReserva,
      horaInicio: horaInicioISO,
      horaFin: horaFinISO,
    };

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
          horaInicio: '',
          horaFin: '',
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

  toggleCambioContrasena(): void {
    this.mostrarCambioContrasena = !this.mostrarCambioContrasena;
    if (!this.mostrarCambioContrasena) {
      this.contrasenaActual = '';
      this.nuevaContrasena = '';
      this.mensajeContrasena = '';
      this.errorContrasena = '';
    }
  }

  cambiarContrasena(): void {
    if (!this.contrasenaActual || !this.nuevaContrasena) {
      this.errorContrasena = 'Ambos campos son obligatorios';
      return;
    }
    if (this.nuevaContrasena.length < 6) {
      this.errorContrasena = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.usuariosService.cambiarContrasena({
      contrasenaActual: this.contrasenaActual,
      nuevaContrasena: this.nuevaContrasena,
    }).subscribe({
      next: (res) => {
        this.mensajeContrasena = res.mensaje;
        this.errorContrasena = '';
        this.contrasenaActual = '';
        this.nuevaContrasena = '';
        setTimeout(() => {
          this.mensajeContrasena = '';
          this.mostrarCambioContrasena = false;
        }, 3000);
      },
      error: (error) => {
        this.errorContrasena = error.error?.message || 'Error al cambiar la contraseña';
        setTimeout(() => { this.errorContrasena = ''; }, 4000);
      },
    });
  }

  get totalPagos(): number {
    return this.misPagos.length;
  }
}
