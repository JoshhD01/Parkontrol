import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VehiculosService } from '../../services/vehiculos.service';
import { Vehiculo, CrearVehiculoDto } from '../../models/vehiculo.model';
import { Reserva } from '../../models/reserva.model';
import { TipoVehiculo } from '../../models/shared.model';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.scss']
})
export class VehiculosComponent implements OnInit {
  searchForm: FormGroup;
  createForm: FormGroup;
  vehiculo: Vehiculo | null = null;
  reservasVehiculo: Reserva[] = [];
  tiposVehiculo: TipoVehiculo[] = [];

  loading = false;
  loadingReservas = false;
  errorMessage = '';
  mensajeExito = '';
  displayedColumns: string[] = ['id', 'placa', 'tipoVehiculo'];
  reservasColumns: string[] = ['id', 'parqueadero', 'estado', 'fechaEntrada', 'fechaSalida'];

  constructor(
    private formBuilder: FormBuilder,
    private vehiculosService: VehiculosService
  ) {
    this.searchForm = this.formBuilder.group({
      placa: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]]
    });

    this.createForm = this.formBuilder.group({
      placa: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      idTipoVehiculo: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarTiposVehiculo();
  }

  private cargarTiposVehiculo(): void {
    this.vehiculosService.getTiposVehiculo().subscribe({
      next: (tipos) => {
        this.tiposVehiculo = tipos;
        if (tipos.length > 0 && !this.createForm.get('idTipoVehiculo')?.value) {
          this.createForm.patchValue({ idTipoVehiculo: tipos[0].id });
        }
      },
      error: (error) => {
        console.error('Error al cargar tipos de vehículo', error);
      }
    });
  }

  onBuscar(): void {
    if (this.searchForm.valid) {

      this.loading = true;
      this.reservasVehiculo = [];
 
      
      const { placa } = this.searchForm.value;
      
      this.vehiculosService.getByPlaca(placa).subscribe({

        next: (vehiculo) => {
          this.vehiculo = vehiculo;
          this.loading = false;
          console.log('Vehiculo', vehiculo);
          this.cargarReservasVehiculo(vehiculo.id);
        },
        error: (error) => {
          console.error('No encontro vehiculo', error);
          this.vehiculo = null;
          this.loading = false;
          
          if (error.status === 404) {
            this.errorMessage = 'No existe vehiculo con la placa ingresada';
          } else {
            this.errorMessage = 'Error al buscar el vehiculo';
          }
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  private cargarReservasVehiculo(idVehiculo: number): void {
    this.loadingReservas = true;
    this.vehiculosService.getHistorialReservas(idVehiculo).subscribe({
      next: (reservas) => {
        this.reservasVehiculo = reservas;
        this.loadingReservas = false;
      },
      error: (error) => {
        console.error('Error al cargar historial de reservas', error);
        this.reservasVehiculo = [];
        this.loadingReservas = false;
      }
    });
  }

  onCrear(): void {

    if (this.createForm.valid) {

      this.loading = true;


      const vehiculoForm: CrearVehiculoDto = this.createForm.value;

      this.vehiculosService.create(vehiculoForm).subscribe({
        next: (vehiculo) => {
          console.log('creado:', vehiculo);
          this.createForm.reset({
            placa: '',
            idTipoVehiculo: 1
          });
          this.loading = false;
          this.vehiculo = vehiculo;
          this.mensajeExito = 'Vehículo creado exitosamente';
          setTimeout(() => {
            this.mensajeExito = '';
          }, 3000);
        },

        error: (error) => {
          console.error('Error creando vehiculo', error);
          this.loading = false;
          
          if (error.status === 409) {
            this.errorMessage = 'Ya existe un vehiculo con la placa ingresada';
          } else if (error.status === 404 ) {
              this.errorMessage = 'No existe el tipo de vehiculo con el ID ingresado';
          } else {
              this.errorMessage = 'Error al crear el vehiculo';
            }
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }});
    }
  }


  limpiarBusqueda(): void {
    this.vehiculo = null;
    this.reservasVehiculo = [];
    this.searchForm.reset();
  }
}