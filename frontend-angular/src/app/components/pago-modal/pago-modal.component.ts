import { Component, Inject, OnInit } from '@angular/core';
import { CrearPagoDto } from '../../models/pago.model';
import { EstadoReserva } from '../../models/shared.model';
import { ReservasService } from '../../services/reservas.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';



export interface PagoDialogData {
  idReserva?: number;
  idParqueadero?: number;
}


@Component({
  selector: 'app-pago-modal',
  standalone: true,
  imports: [

    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './pago-modal.component.html',
  styleUrls: ['./pago-modal.component.scss']
})
export class PagoModalComponent implements OnInit {


  pagoForm!: FormGroup;
  reservasActivas: any[] = [];
  mostrarSelectorReserva = false;

  loading = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<PagoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PagoDialogData,
    private readonly reservasService: ReservasService
  ) {}

  ngOnInit(): void {
    if (this.data.idReserva) {

      this.pagoForm = this.formBuilder.group({
        idReserva: [{ value: this.data.idReserva, disabled: true }, [Validators.required]],
        idMetodoPago: [null, [Validators.required, Validators.min(1)]]
      });
      this.mostrarSelectorReserva = false;

    } else if (this.data.idParqueadero) {

      this.reservasService.getByParqueadero(this.data.idParqueadero).subscribe({
        next: (reservas) => {
          this.reservasActivas = reservas.filter(r => r.estado === EstadoReserva.ABIERTA);
        },
        error: (error) => {
          if (error?.status !== 404) {
            console.error('No cargaron reservas', error);
          }
          this.reservasActivas = [];
        }
      });

      this.pagoForm = this.formBuilder.group({
        idReserva: [null, [Validators.required]],
        idMetodoPago: [null, [Validators.required, Validators.min(1)]]
      });

      this.mostrarSelectorReserva = true;
    }
    
  }

  onSubmit(): void {
    if (this.pagoForm.valid) {
      this.loading = true;
      
      const pagoData: CrearPagoDto = {
        idReserva: this.data.idReserva ?? this.pagoForm.get('idReserva')?.value,
        idMetodoPago: this.pagoForm.get('idMetodoPago')?.value
      };
      
      this.dialogRef.close(pagoData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}