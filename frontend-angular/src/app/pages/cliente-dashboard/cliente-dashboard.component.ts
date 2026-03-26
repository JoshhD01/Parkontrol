import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class ClienteDashboardComponent implements OnInit, OnDestroy {
  private readonly maxItemsVisible = 4;

  parqueaderos: Parqueadero[] = [];
  vehiculosCliente: Vehiculo[] = [];
  reservas: Reserva[] = [];
  facturas: FacturaElectronica[] = [];
  misPagos: Pago[] = [];
  mostrarTodasReservas = false;
  mostrarTodasFacturas = false;
  mostrarTodosPagos = false;
  loading = false;
  creandoReserva = false;
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
  };
  duracionHoras = 2;
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
      error: (error) => {
        if (error?.status === 404) {
          this.parqueaderos = [];
        } else {
          this.errorMessage = 'No se pudieron cargar los parqueaderos disponibles';
        }
      },
    });

    this.reservasService.getMisReservasCliente().subscribe({
      next: (data) => {
        this.reservas = data;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.reservas = [];
        } else {
          this.errorMessage = 'No se pudieron cargar tus reservas';
        }
      },
    });

    this.reservasService.getMisVehiculosCliente().subscribe({
      next: (data) => {
        this.vehiculosCliente = data.map((vehiculo) => ({
          ...vehiculo,
          idTipoVehiculo: this.obtenerIdTipoVehiculo(vehiculo),
        }));
        if (data.length === 0) {
          this.usarVehiculoExistente = false;
        }
      },
      error: (error) => {
        if (error?.status === 404) {
          this.vehiculosCliente = [];
          this.usarVehiculoExistente = false;
        } else {
          this.errorMessage = 'No se pudieron cargar tus vehículos';
        }
      },
    });

    this.facturacionService.getMisFacturasCliente().subscribe({
      next: (data) => {
        this.facturas = data;
        if (mostrarLoading) {
          this.loading = false;
        }
      },
      error: (error) => {
        if (error?.status === 404) {
          this.facturas = [];
        } else {
          this.errorMessage = 'No se pudieron cargar tus facturas';
        }
        if (mostrarLoading) {
          this.loading = false;
        }
      },
    });

    this.pagosService.getMisPagos().subscribe({
      next: (data) => {
        this.misPagos = data;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.misPagos = [];
        } else {
          this.errorMessage = 'No se pudieron cargar tus pagos';
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

  private convertirAISO(valor: string): string | null {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return null;
    }
    return fecha.toISOString();
  }

  private calcularHoraFinISO(horaInicio: string, duracionHoras: number): string | null {
    const fechaInicio = new Date(horaInicio);
    if (Number.isNaN(fechaInicio.getTime())) {
      return null;
    }

    const horas = Number(duracionHoras);
    if (Number.isFinite(horas) === false || horas <= 0) {
      return null;
    }

    const fechaFin = new Date(fechaInicio.getTime() + horas * 60 * 60 * 1000);
    return fechaFin.toISOString();
  }

  crearReserva(): void {
    this.errorMessage = '';

    const idParqueadero = Number(this.nuevaReserva.idParqueadero);

    if (Number.isFinite(idParqueadero) === false || idParqueadero <= 0) {
      this.errorMessage = 'Debes seleccionar un parqueadero';
      return;
    }

    if (this.nuevaReserva.horaInicio.length === 0) {
      this.errorMessage = 'Debes ingresar hora de inicio';
      return;
    }

    if (Number.isFinite(this.duracionHoras) === false || this.duracionHoras <= 0) {
      this.errorMessage = 'La duración debe ser mayor a 0 horas';
      return;
    }

    const horaInicioISO = this.convertirAISO(this.nuevaReserva.horaInicio);
    const horaFinISO = this.calcularHoraFinISO(
      this.nuevaReserva.horaInicio,
      this.duracionHoras,
    );

    if (horaInicioISO === null || horaFinISO === null) {
      this.errorMessage = 'El formato de hora no es válido';
      return;
    }

    let payload = {
      ...this.nuevaReserva,
      idParqueadero,
      horaInicio: horaInicioISO,
      horaFin: horaFinISO,
    };

    if (this.usarVehiculoExistente) {
      const idVehiculoNum = Number(this.idVehiculoSeleccionado);
      const vehiculo = this.vehiculosCliente.find(
        (item) => item.id === idVehiculoNum,
      );
      if (vehiculo === undefined) {
        this.errorMessage = 'Debes seleccionar un vehículo existente';
        return;
      }

      payload = {
        ...payload,
        placa: vehiculo.placa,
        idTipoVehiculo: Number(vehiculo.idTipoVehiculo) as 1 | 2,
      };
    } else if (this.nuevaReserva.placa.trim().length === 0) {
      this.errorMessage = 'Debes ingresar una placa';
      return;
    } else {
      payload = {
        ...payload,
        idTipoVehiculo: Number(this.nuevaReserva.idTipoVehiculo) as 1 | 2,
      };
    }

    this.creandoReserva = true;

    this.reservasService.crearComoCliente(payload).subscribe({
      next: () => {
        this.nuevaReserva = {
          idParqueadero: 0,
          placa: '',
          idTipoVehiculo: 1,
          horaInicio: '',
        };
        this.duracionHoras = 2;
        this.idVehiculoSeleccionado = 0;
        this.creandoReserva = false;
        this.cargarDatos();
      },
      error: (error) => {
        const backendMessage = error?.error?.message;
        if (Array.isArray(backendMessage)) {
          this.errorMessage = backendMessage.join('. ');
        } else if (typeof backendMessage === 'string' && backendMessage.trim()) {
          this.errorMessage = backendMessage;
        } else {
          this.errorMessage = 'No fue posible crear la reserva';
        }
        this.creandoReserva = false;
      },
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleCambioContrasena(): void {
    this.mostrarCambioContrasena = !this.mostrarCambioContrasena;
    if (this.mostrarCambioContrasena === false) {
      this.contrasenaActual = '';
      this.nuevaContrasena = '';
      this.mensajeContrasena = '';
      this.errorContrasena = '';
    }
  }

  cambiarContrasena(): void {
    if (this.contrasenaActual.length === 0 || this.nuevaContrasena.length === 0) {
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

  get reservasVisibles(): Reserva[] {
    return this.mostrarTodasReservas
      ? this.reservas
      : this.reservas.slice(0, this.maxItemsVisible);
  }

  get facturasVisibles(): FacturaElectronica[] {
    return this.mostrarTodasFacturas
      ? this.facturas
      : this.facturas.slice(0, this.maxItemsVisible);
  }

  get pagosVisibles(): Pago[] {
    return this.mostrarTodosPagos
      ? this.misPagos
      : this.misPagos.slice(0, this.maxItemsVisible);
  }

  get hayMasReservas(): boolean {
    return this.reservas.length > this.maxItemsVisible;
  }

  get hayMasFacturas(): boolean {
    return this.facturas.length > this.maxItemsVisible;
  }

  get hayMasPagos(): boolean {
    return this.misPagos.length > this.maxItemsVisible;
  }

  get reservasOcultas(): number {
    return Math.max(0, this.reservas.length - this.maxItemsVisible);
  }

  get facturasOcultas(): number {
    return Math.max(0, this.facturas.length - this.maxItemsVisible);
  }

  get pagosOcultos(): number {
    return Math.max(0, this.misPagos.length - this.maxItemsVisible);
  }

  toggleReservas(): void {
    this.mostrarTodasReservas = !this.mostrarTodasReservas;
  }

  toggleFacturas(): void {
    this.mostrarTodasFacturas = !this.mostrarTodasFacturas;
  }

  togglePagos(): void {
    this.mostrarTodosPagos = !this.mostrarTodosPagos;
  }
}
