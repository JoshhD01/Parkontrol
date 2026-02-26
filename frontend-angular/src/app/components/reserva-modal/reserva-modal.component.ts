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
    MatProgressSpinnerModule
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
    @Inject(MAT_DIALOG_DATA) public data: ReservaDialogData
  ) {
    this.reservaForm = this.formBuilder.group({
      placa: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      idCelda: ['', [Validators.required]],
      idClienteFactura: [null],
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

    this.vehiculosService.getByPlaca(placa).subscribe({
      next: (vehiculo: Vehiculo) => {
        const cerrarConReserva = (idClienteFactura?: number): void => {
          const reservaData: CrearReservaDto = {
            idVehiculo: vehiculo.id,
            idCelda: formValue.idCelda,
            estado: EstadoReserva.ABIERTA,
            idClienteFactura,
          };

          this.dialogRef.close(reservaData);
          this.loading = false;
        };

        const idClienteSeleccionado = formValue.idClienteFactura ? Number(formValue.idClienteFactura) : undefined;
        if (idClienteSeleccionado) {
          cerrarConReserva(idClienteSeleccionado);
          return;
        }

        if (!this.tieneDatosNuevoCliente()) {
          cerrarConReserva();
          return;
        }

        const nuevoCliente: CrearClienteFacturaDto = {
          tipoDocumento: String(formValue.tipoDocumento).trim().toUpperCase(),
          numeroDocumento: String(formValue.numeroDocumento).trim(),
          correo: String(formValue.correoCliente).trim().toLowerCase(),
        };

        this.facturacionService.crearClienteFactura(nuevoCliente).subscribe({
          next: (cliente) => {
            cerrarConReserva(cliente.id);
          },
          error: (error) => {
            console.error('Error al crear cliente rápido:', error);
            this.errorMessage = 'No fue posible crear el cliente de facturación. Intenta nuevamente.';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        if (error.status === 404) {
          alert(`Vehiculo con placa "${placa}" no esta registrado`);
          this.irAVehiculos();
        } else {
          console.error('Error vehiculo no encontrado:', error);
          this.errorMessage = 'No fue posible validar el vehículo en este momento.';
        }

        this.loading = false;
      }
    });
  }

  irAVehiculos(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}