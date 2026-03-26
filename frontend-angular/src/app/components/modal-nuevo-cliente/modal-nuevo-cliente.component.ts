import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearClienteFacturaDto } from '../../models/facturacion.model';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-cliente-factura-modal',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule, MatSelectModule],
  templateUrl: './modal-nuevo-cliente.component.html',
  styleUrls: ['./modal-nuevo-cliente.component.scss']
})
export class ClienteFacturaModalComponent {
  formGroup: FormGroup;
  loading = false;
  tiposDocumento = ['CC', 'CE', 'TI', 'PAS', 'NIT'];

  constructor(
    private readonly formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ClienteFacturaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formGroup = this.formBuilder.group({
      tipoDocumento: ['CC', Validators.required],
      numeroDocumento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]]
    });

    this.actualizarValidadoresNumeroDocumento('CC');
    this.formGroup.get('tipoDocumento')?.valueChanges.subscribe((tipo) => {
      this.actualizarValidadoresNumeroDocumento(String(tipo ?? ''));
    });
  }

  private actualizarValidadoresNumeroDocumento(tipoDocumento: string): void {
    const control = this.formGroup.get('numeroDocumento');
    if (!control) return;

    const tipo = tipoDocumento.toUpperCase();
    const base = [Validators.required];

    if (tipo === 'CC') {
      control.setValidators([...base, Validators.pattern(/^\d{6,10}$/)]);
    } else if (tipo === 'TI') {
      control.setValidators([...base, Validators.pattern(/^\d{10,11}$/)]);
    } else if (tipo === 'CE') {
      control.setValidators([...base, Validators.pattern(/^\d{6,12}$/)]);
    } else if (tipo === 'NIT') {
      control.setValidators([...base, Validators.pattern(/^\d{8,10}(-\d)?$/)]);
    } else if (tipo === 'PAS') {
      control.setValidators([...base, Validators.pattern(/^[A-Za-z0-9]{5,20}$/)]);
    } else {
      control.setValidators(base);
    }

    control.updateValueAndValidity();
  }

  getMensajeErrorNumeroDocumento(): string {
    const control = this.formGroup.get('numeroDocumento');
    if (!control?.errors) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    const tipo = String(this.formGroup.get('tipoDocumento')?.value ?? '').toUpperCase();
    if (control.hasError('pattern')) {
      if (tipo === 'CC') return 'CC: solo números (6 a 10 dígitos)';
      if (tipo === 'TI') return 'TI: solo números (10 a 11 dígitos)';
      if (tipo === 'CE') return 'CE: solo números (6 a 12 dígitos)';
      if (tipo === 'NIT') return 'NIT: 8 a 10 dígitos, opcional guion y dígito verificador';
      if (tipo === 'PAS') return 'PAS: alfanumérico de 5 a 20 caracteres';
    }

    return 'Formato de documento inválido';
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      const cliente: CrearClienteFacturaDto = {
        ...this.formGroup.value,
        tipoDocumento: String(this.formGroup.value.tipoDocumento ?? '').trim().toUpperCase(),
        numeroDocumento: String(this.formGroup.value.numeroDocumento ?? '').trim().toUpperCase(),
        correo: String(this.formGroup.value.correo ?? '').trim().toLowerCase(),
      };
      setTimeout(() => {
        this.dialogRef.close(cliente);
        this.loading = false;
      }, 2000); 
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
