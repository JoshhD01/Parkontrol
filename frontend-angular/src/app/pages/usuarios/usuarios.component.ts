import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/autenticacion.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CreateUsuarioDto, Usuario } from '../../models/usuario.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UsuarioModalComponent, UsuarioDialogData } from '../../components/usuario-modal/usuario-modal.component';
import { RolUsuario } from '../../models/shared.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  usuarioActual: Usuario | null = null;
  usuarios: Usuario[] = [];
  administrador = RolUsuario.ADMINISTRADOR;

  loading = false;
  errorMessage = '';
  mensajeExito: string = '';

  // Password change
  cambioContrasenaForm: FormGroup;
  mostrarCambioContrasena = false;
  hideContrasenaActual = true;
  hideNuevaContrasena = true;

  displayedColumns: string[] = ['id', 'nombre', 'correo', 'acciones'];
  

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    this.cambioContrasenaForm = this.fb.group({
      contrasenaActual: ['', [Validators.required]],
      nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {

    this.usuarioActual = this.authService.getUsuarioActual();
    if (this.usuarioActual && this.usuarioActual.idEmpresa) {

      this.cargarUsuariosPorEmpresa(this.usuarioActual.idEmpresa);
    } else {

      this.errorMessage = 'no hay usuario autenticado';
    }
  }


  private cargarUsuariosPorEmpresa(idEmpresa: number): void {
      this.loading = true;
      this.usuariosService.getByEmpresa(idEmpresa).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar usuarios';
        this.usuarios = [];
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    const usuarioActual = this.authService.getUsuarioActual();
    if (!usuarioActual || !usuarioActual.idEmpresa) return;

    const data: UsuarioDialogData = {
      idEmpresa: usuarioActual.idEmpresa
    };

    const dialogRef = this.dialog.open(UsuarioModalComponent, {
      width: '600px',
      data,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((usuario: CreateUsuarioDto) => {
      if (usuario) {
        this.crearUsuario(usuario);
      }
    });
  }

  private crearUsuario(usuarioData: CreateUsuarioDto): void {
    this.usuariosService.create(usuarioData).subscribe({
      next: () => {
        this.mensajeExito = 'Usuario creado exitosamente';
        const usuario = this.authService.getUsuarioActual();
        if (usuario && usuario.idEmpresa) {
          this.cargarUsuariosPorEmpresa(usuario.idEmpresa);
        }
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error) => {

        if (error.status === 409) {
          this.errorMessage = 'Ya existe un usuario con el correo ingresado';
        } else {

          this.errorMessage = 'Error al crear usuario';
        }

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      },
    });
  }

  eliminarUsuario(id: number): void {
    this.usuariosService.delete(id).subscribe({
      next: () => {
        this.mensajeExito = 'Usuario operador eliminado exitosamente';
        this.usuarioActual?.idEmpresa ? this.cargarUsuariosPorEmpresa(this.usuarioActual.idEmpresa) : null;
        
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error) => {
        if (error.status === 403) {
          this.errorMessage = 'Solo se pueden eliminar usuarios con rol OPERADOR';
        } else {
          this.errorMessage = 'Error al eliminar usuario';
        }
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  toggleCambioContrasena(): void {
    this.mostrarCambioContrasena = !this.mostrarCambioContrasena;
    if (!this.mostrarCambioContrasena) {
      this.cambioContrasenaForm.reset();
    }
  }

  cambiarContrasena(): void {
    if (this.cambioContrasenaForm.invalid) return;

    const data = this.cambioContrasenaForm.value;
    this.usuariosService.cambiarContrasena(data).subscribe({
      next: (res) => {
        this.mensajeExito = res.mensaje;
        this.cambioContrasenaForm.reset();
        this.mostrarCambioContrasena = false;
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
      },
      error: (error) => {
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'La contraseña actual es incorrecta';
        } else {
          this.errorMessage = 'Error al cambiar la contraseña';
        }
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }
}