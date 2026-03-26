import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CrearCeldaDto } from '../../models/celda.model';
import { Parqueadero } from '../../models/parqueadero.model';
import { EstadoCelda } from '../../models/shared.model';

export interface CeldaDialogData {
  parqueaderos: Parqueadero[];
}

@Component({
  selector: 'app-celda-modal',
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
  templateUrl: './celda-modal.component.html',
  styleUrls: ['./celda-modal.component.scss']
})
export class CeldaModalComponent {
  celdaForm: FormGroup;

  estadosCeldas = [
    { valor: EstadoCelda.LIBRE, nombre: 'Libre' },
    { valor: EstadoCelda.OCUPADA, nombre: 'Ocupada' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<CeldaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CeldaDialogData
  ) {
    this.celdaForm = this.fb.group({
      idParqueadero: [null, [Validators.required, Validators.min(1)]],
      idTipoCelda: [1, [Validators.required, Validators.min(1)]],
      idSensor: [1, [Validators.required, Validators.min(1)]],
      estado: ['DISPONIBLE', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.celdaForm.valid) {
      const celdaData: CrearCeldaDto = this.celdaForm.value;
      this.dialogRef.close(celdaData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}