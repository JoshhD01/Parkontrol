import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/autenticacion.service';
import {
  RegistrarClienteDto,
  RegistroClienteResponse,
  TipoDocumentoCliente,
} from '../../models/usuario.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registerForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessages: string[] = [];
  readonly tipoDocumentoOptions: { value: TipoDocumentoCliente; label: string }[]
    = [
      { value: 'CC', label: 'Cédula de ciudadanía (CC)' },
      { value: 'CE', label: 'Cédula de extranjería (CE)' },
      { value: 'TI', label: 'Tarjeta de identidad (TI)' },
      { value: 'PAS', label: 'Pasaporte (PAS)' },
      { value: 'NIT', label: 'NIT' },
    ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      tipoDocumento: ['CC', [Validators.required]],
      numeroDocumento: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[A-Za-z0-9-]+$/),
        ],
      ],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      contrasena: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
        ],
      ],
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessages = [];
      const registerData: RegistrarClienteDto = {
        ...this.registerForm.value,
      };

      this.authService.register(registerData).subscribe({
        next: (cliente: RegistroClienteResponse) => {
          console.log('Registro cliente exitoso:', cliente);
          this.router.navigate(['/login']);
        },

        error: (error: HttpErrorResponse) => {
          this.loading = false;
          console.error('Error en el registro:', error);

          this.errorMessages = this.extractErrorMessages(error);

          setTimeout(() => {
            this.errorMessages = [];
          }, 5000);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  private extractErrorMessages(error: HttpErrorResponse): string[] {
    if (error.status === 0) {
      return ['No se pudo conectar con el servidor. Verifica que el backend esté encendido.'];
    }

    const backendError = error.error;

    if (Array.isArray(backendError?.errors) && backendError.errors.length > 0) {
      return backendError.errors;
    }

    if (Array.isArray(backendError?.message) && backendError.message.length > 0) {
      return backendError.message;
    }

    if (typeof backendError?.message === 'string' && backendError.message.trim().length > 0) {
      return [backendError.message];
    }

    if (error.status === 404) {
      return ['No se encontró el recurso solicitado para el registro.'];
    }

    if (error.status === 409) {
      return ['Ya existe un usuario con este correo electrónico. Usa otro correo.'];
    }

    if (error.status >= 500) {
      return ['Error del servidor. Intenta de nuevo en unos minutos.'];
    }

    return ['No fue posible registrar el usuario normal. Revisa los datos e intenta nuevamente.'];
  }
}