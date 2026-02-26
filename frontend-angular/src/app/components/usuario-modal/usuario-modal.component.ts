import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RolUsuario } from '../../models/shared.model';
import { min } from 'rxjs';

export interface UsuarioDialogData {
  idEmpresa: number;
}

export interface CreateUsuarioDto {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  idEmpresa: number;
}

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './usuario-modal.component.html',
  styleUrls: ['./usuario-modal.component.scss']
})
export class UsuarioModalComponent implements OnInit {
  form!: FormGroup;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UsuarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: [{ value: 'OPERADOR', disabled: true }, Validators.required],
      idEmpresa: [{ value: this.data.idEmpresa, disabled: true }, Validators.required],
    });
  }

  submit(): void {
    if (this.form.valid) {
      const usuarioData: CreateUsuarioDto = {
        nombre: this.form.get('nombre')?.value,
        correo: this.form.get('correo')?.value,
        contrasena: this.form.get('contrasena')?.value,
        rol: RolUsuario.OPERADOR,
        idEmpresa: this.data.idEmpresa,
      };
      this.dialogRef.close(usuarioData);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
