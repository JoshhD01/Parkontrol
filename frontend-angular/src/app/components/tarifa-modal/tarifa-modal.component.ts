import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Tarifa } from '../../models/tarifa.model';
import { Parqueadero } from '../../models/parqueadero.model';

export interface TarifaDialogData {
  parqueaderos: Parqueadero[];
  tarifa?: Tarifa;
}



@Component({

  selector: 'app-tarifa-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './tarifa-modal.component.html',
  styleUrls: ['./tarifa-modal.component.scss']
})
export class TarifaModalComponent {
  tarifaForm: FormGroup;
  isEditing: boolean;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<TarifaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TarifaDialogData
  ) {

    this.isEditing = !!this.data.tarifa;

    this.tarifaForm = this.formBuilder.group({
      idParqueadero: [
        { value: this.data.tarifa?.idParqueadero || null, disabled: this.isEditing }, 
        [
            Validators.required, 
            Validators.min(1)]
      ],
      idTipoVehiculo: [
        { value: this.data.tarifa?.idTipoVehiculo || 1, disabled: this.isEditing }, 
        [
            Validators.required, 
            Validators.min(1)]
      ],
      
      precioFraccionHora: [this.data.tarifa?.precioFraccionHora || null, [Validators.required, Validators.min(0)]],
      precioHoraAdicional: [this.data.tarifa?.precioHoraAdicional || null, [Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.tarifaForm.valid) {
      let formData;
      
      if (this.isEditing) {
        formData = {
          precioFraccionHora: this.tarifaForm.get('precioFraccionHora')?.value,
          precioHoraAdicional: this.tarifaForm.get('precioHoraAdicional')?.value || null
        };
      } else {
 
        formData = this.tarifaForm.value;
        if (!formData.precioHoraAdicional) {
          formData.precioHoraAdicional = null;
        }

    }
      this.dialogRef.close(formData);
    }
  }


  onCancel(): void {
    this.dialogRef.close();
  }
}