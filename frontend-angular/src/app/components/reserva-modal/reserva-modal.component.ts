import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { VehiculosService } from '../../services/vehiculos.service';
import { CeldasService } from '../../services/celdas.service';
import { FacturacionService } from '../../services/facturacion.service';
import { Celda } from '../../models/celda.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { CrearReservaDto } from '../../models/reserva.model';
import { ClienteFactura, CrearClienteFacturaDto } from '../../models/facturacion.model';
import { EstadoCelda, EstadoReserva } from '../../models/shared.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservasService } from '../../services/reservas.service';



export interface ReservaDialogData {
  idParqueadero: number;
}

@Component({
  selector: 'app-reserva-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './reserva-modal.component.html',
  styleUrls: ['./reserva-modal.component.scss']
})
export class ReservaModalComponent implements OnInit {
  
  reservaForm: FormGroup;
  celdas: Celda[] = [];
  clientesFactura: ClienteFactura[] = [];

  loading = false;
  loadingCeldas = false;
  loadingClientes = false;
  mostrarFormularioNuevoCliente = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ReservaModalComponent>,
    private vehiculosService: VehiculosService,
    private celdasService: CeldasService,
    private facturacionService: FacturacionService,
    private reservasService: ReservasService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: ReservaDialogData
  ) {
    this.reservaForm = this.formBuilder.group({
      placa: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      idCelda: ['', [Validators.required]],
      idClienteFactura: [null],
      horaInicio: [null, [Validators.required]],
      horaFin: [null, [Validators.required]],
      tipoDocumento: [''],
      numeroDocumento: [''],
      correoCliente: [''],

      estado: [{ value: EstadoReserva.ABIERTA, disabled: true }, [Validators.required]]
    });
  }


  ngOnInit(): void {
    this.cargarCeldasDisponibles();
    this.cargarClientesFactura();
  }

  private cargarCeldasDisponibles(): void {

    this.loadingCeldas = true;
    this.reservaForm.get('idCelda')?.disable();
    
    this.celdasService.getByParqueadero(this.data.idParqueadero).subscribe({
      next: (todasLasCeldas) => {
     

        this.celdas = todasLasCeldas.filter(celda => 
          celda.estado === EstadoCelda.LIBRE
        );
        
        this.loadingCeldas = false;
        this.reservaForm.get('idCelda')?.enable();

      },
      error: (error) => {
        console.error('Error al cargar celdas:', error);
        this.celdas = [];

        this.loadingCeldas = false;
        this.reservaForm.get('idCelda')?.enable();
      }
    });
  }

  private cargarClientesFactura(): void {
    this.loadingClientes = true;
    this.facturacionService.obtenerClientesFactura().subscribe({
      next: (clientes) => {
        this.clientesFactura = clientes;
        this.loadingClientes = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes de facturación:', error);
        this.clientesFactura = [];
        this.loadingClientes = false;
      }
    });
  }


  private tieneDatosNuevoCliente(): boolean {
    const tipoDocumento = String(this.reservaForm.get('tipoDocumento')?.value ?? '').trim();
    const numeroDocumento = String(this.reservaForm.get('numeroDocumento')?.value ?? '').trim();
    const correoCliente = String(this.reservaForm.get('correoCliente')?.value ?? '').trim();

    return tipoDocumento.length > 0 || numeroDocumento.length > 0 || correoCliente.length > 0;
  }

  private validarDatosNuevoCliente(): boolean {
    if (!this.mostrarFormularioNuevoCliente && !this.tieneDatosNuevoCliente()) {
      return true;
    }

    const tipoDocumento = String(this.reservaForm.get('tipoDocumento')?.value ?? '').trim();
    const numeroDocumento = String(this.reservaForm.get('numeroDocumento')?.value ?? '').trim();
    const correoCliente = String(this.reservaForm.get('correoCliente')?.value ?? '').trim();

    const completos = tipoDocumento.length > 0 && numeroDocumento.length > 0 && correoCliente.length > 0;
    if (!completos) {
      this.errorMessage = 'Si vas a crear cliente rápido, debes completar tipo de documento, número y correo.';
      return false;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoCliente);
    if (!correoValido) {
      this.errorMessage = 'El correo del cliente no tiene un formato válido.';
      return false;
    }

    return true;
  }

  toggleNuevoCliente(): void {
    this.mostrarFormularioNuevoCliente = !this.mostrarFormularioNuevoCliente;

    if (!this.mostrarFormularioNuevoCliente) {
      this.reservaForm.patchValue({
        tipoDocumento: '',
        numeroDocumento: '',
        correoCliente: ''
      });
    }
  }

  onSubmit(): void {
    if (!this.reservaForm.valid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    if (!this.validarDatosNuevoCliente()) {
      this.loading = false;
      return;
    }

    const formValue = this.reservaForm.getRawValue();
    const placa = String(formValue.placa ?? '').trim().toUpperCase();
    const horaInicio = this.convertirAISO(formValue.horaInicio);
    const horaFin = this.convertirAISO(formValue.horaFin);

    if (!horaInicio || !horaFin) {
      this.errorMessage = 'Debes ingresar hora de inicio y hora de fin.';
      this.loading = false;
      return;
    }

    if (new Date(horaFin).getTime() <= new Date(horaInicio).getTime()) {
      this.errorMessage = 'La hora de fin debe ser mayor a la hora de inicio.';
      this.loading = false;
      return;
    }

    this.obtenerOCrearVehiculo(placa, Number(formValue.idCelda))
      .then((vehiculo) => this.resolverClienteFactura(formValue).then((idClienteFactura) => ({ vehiculo, idClienteFactura })))
      .then(({ vehiculo, idClienteFactura }) => {
        const reservaData: CrearReservaDto = {
          idVehiculo: vehiculo.id,
          idCelda: Number(formValue.idCelda),
          estado: EstadoReserva.ABIERTA,
          idClienteFactura,
          horaInicio,
          horaFin,
        };

        this.reservasService.create(reservaData).subscribe({
          next: () => {
            this.snackBar.open('Reserva creada exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error al crear reserva:', error);
            const backendMessage = this.extraerMensajeError(error);
            this.errorMessage = backendMessage;
            this.snackBar.open(backendMessage, 'Cerrar', {
              duration: 4000,
              panelClass: ['snackbar-error'],
            });
            this.loading = false;
          },
        });
      })
      .catch((errorMessage) => {
        this.errorMessage = errorMessage;
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-error'],
        });
        this.loading = false;
      });
  }

  private extraerMensajeError(error: any): string {
    const backendMessage = error?.error?.message;
    if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
      return backendMessage;
    }
    if (Array.isArray(backendMessage) && backendMessage.length > 0) {
      return String(backendMessage[0]);
    }
    return 'No fue posible crear la reserva. Intenta nuevamente.';
  }

  private obtenerTipoVehiculoDesdeCelda(idCelda: number): number | null {
    const celdaSeleccionada = this.celdas.find((celda) => celda.id === idCelda);
    if (!celdaSeleccionada) {
      return null;
    }

    const idDesdeCampo = Number((celdaSeleccionada as any).idTipoCelda);
    if (Number.isFinite(idDesdeCampo) && idDesdeCampo > 0) {
      return idDesdeCampo;
    }

    const idDesdeRelacion = Number((celdaSeleccionada as any).tipoCelda?.id);
    if (Number.isFinite(idDesdeRelacion) && idDesdeRelacion > 0) {
      return idDesdeRelacion;
    }

    const nombreTipoCelda = String((celdaSeleccionada as any).tipoCelda?.nombre ?? '')
      .trim()
      .toUpperCase();

    if (nombreTipoCelda.includes('PARTICULAR')) {
      return 1;
    }
    if (nombreTipoCelda.includes('MOTO')) {
      return 2;
    }
    if (nombreTipoCelda.includes('CAMIONETA') || nombreTipoCelda.includes('DISCAPACITADO')) {
      return 3;
    }

    return null;
  }

  private obtenerOCrearVehiculo(placa: string, idCelda: number): Promise<Vehiculo> {
    return new Promise((resolve, reject) => {
      this.vehiculosService.getByPlaca(placa).subscribe({
        next: (vehiculo) => resolve(vehiculo),
        error: (error) => {
          if (error.status !== 404) {
            console.error('Error validando placa:', error);
            reject('No fue posible validar la placa en este momento.');
            return;
          }

          const idTipoVehiculo = this.obtenerTipoVehiculoDesdeCelda(idCelda);
          if (!idTipoVehiculo) {
            reject('No se pudo determinar el tipo de vehículo según la celda seleccionada.');
            return;
          }

          this.vehiculosService
            .create({ placa, idTipoVehiculo })
            .subscribe({
              next: (vehiculoCreado) => resolve(vehiculoCreado),
              error: (crearError) => {
                console.error('Error creando vehículo automático:', crearError);
                reject(this.extraerMensajeError(crearError));
              },
            });
        },
      });
    });
  }

  private resolverClienteFactura(formValue: any): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      const idClienteSeleccionado = formValue.idClienteFactura
        ? Number(formValue.idClienteFactura)
        : undefined;

      if (idClienteSeleccionado) {
        resolve(idClienteSeleccionado);
        return;
      }

      if (!this.tieneDatosNuevoCliente()) {
        resolve(undefined);
        return;
      }

      const nuevoCliente: CrearClienteFacturaDto = {
        tipoDocumento: String(formValue.tipoDocumento).trim().toUpperCase(),
        numeroDocumento: String(formValue.numeroDocumento).trim(),
        correo: String(formValue.correoCliente).trim().toLowerCase(),
      };

      this.facturacionService.crearClienteFactura(nuevoCliente).subscribe({
        next: (cliente) => resolve(cliente.id),
        error: (error) => {
          console.error('Error al crear cliente rápido:', error);
          reject(this.extraerMensajeError(error));
        },
      });
    });
  }

  private convertirAISO(valor: string | null | undefined): string | undefined {
    if (!valor) {
      return undefined;
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return undefined;
    }

    return fecha.toISOString();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}