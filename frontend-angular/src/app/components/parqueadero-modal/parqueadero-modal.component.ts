import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CrearParqueaderoDto } from '../../models/parqueadero.model';

export interface ParqueaderoDialogData {
  idEmpresa: number;
}

@Component({
  selector: 'app-parqueadero-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './parqueadero-modal.component.html',
  styleUrls: ['./parqueadero-modal.component.scss']
})
export class ParqueaderoModalComponent {
  parqueaderoForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,

    public dialogRef: MatDialogRef<ParqueaderoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ParqueaderoDialogData
  ) {

    this.parqueaderoForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        ubicacion: ['', [Validators.required, Validators.minLength(3)]],
        capacidadTotal: [1, [Validators.required, Validators.min(1)]],
        idEmpresa: [this.data.idEmpresa, [Validators.required]]
    });
  }



  onSubmit(): void {
    if (this.parqueaderoForm.valid) {
        
      const parqueaderoData: CrearParqueaderoDto = this.parqueaderoForm.value;
      this.dialogRef.close(parqueaderoData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get submitButtonText(): string {
    return 'Crear';
  }
}