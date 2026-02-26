import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/autenticacion.service';
import { LoginUsuarioDto, TipoAccesoLogin } from '../../models/usuario.model';
import { RolUsuario } from '../../models/shared.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.loginByAccess('CLIENTE');
  }

  onLoginAdmin(): void {
    this.loginByAccess('ADMIN');
  }

  onLoginOperador(): void {
    this.loginByAccess('OPERADOR');
  }

  private loginByAccess(tipoAcceso: TipoAccesoLogin): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const credentials: LoginUsuarioDto = {
        correo: this.loginForm.value.correo,
        contrasena: this.loginForm.value.contrasena,
        tipoAcceso,
      };

      this.authService.loginByAccess(
        {
          correo: credentials.correo,
          contrasena: credentials.contrasena,
        },
        tipoAcceso,
      ).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          
          const currentUser = this.authService.getUsuarioActual();

          if (
            tipoAcceso === 'ADMIN' &&
            currentUser &&
            currentUser.rol === RolUsuario.ADMINISTRADOR
          ) {
            this.router.navigate(['/dashboard']);
          } else if (
            tipoAcceso === 'CLIENTE' &&
            currentUser &&
            currentUser.rol === RolUsuario.CLIENTE
          ) {
            this.router.navigate(['/cliente-dashboard']);
          } else if (
            tipoAcceso === 'OPERADOR' &&
            currentUser &&
            currentUser.rol === RolUsuario.OPERADOR
          ) {
            this.router.navigate(['/operador-dashboard']);
          } else {
            this.authService.logout();
            this.errorMessage =
              'Acceso denegado: el usuario no corresponde al tipo de ingreso seleccionado';
            this.router.navigate(['/login']);
          }
        },

        error: (error) => {
          this.loading = false;
          console.error('Error en el login:', error);

          const backendMessage: string | undefined = error?.error?.message;
          if (backendMessage) {
            this.errorMessage = backendMessage;
            setTimeout(() => {
              this.errorMessage = '';
            }, 5000);
            return;
          }
          
          if (error.status === 401) {
            this.errorMessage = 'Credenciales incorrectas, verifica otra vez tu correo y contraseña';
          } else if (error.status === 0) {
            this.errorMessage = 'Error de conexion verificar el servidor';
          } else if (error.status === 500) {
            this.errorMessage = 'Error del servidor.';
          }
          setTimeout(() => {
          this.errorMessage = '';
          }, 5000);

        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

}