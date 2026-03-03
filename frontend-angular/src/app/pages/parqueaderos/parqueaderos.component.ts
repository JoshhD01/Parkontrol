import { Component, OnInit } from '@angular/core';
import { ParqueaderosService } from '../../services/parqueaderos.service';
import { AuthService } from '../../services/autenticacion.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Parqueadero, CrearParqueaderoDto } from '../../models/parqueadero.model';
import { ParqueaderoModalComponent, ParqueaderoDialogData } from '../../components/parqueadero-modal/parqueadero-modal.component';

@Component({
  selector: 'app-parqueaderos',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './parqueaderos.component.html',
  styleUrls: ['./parqueaderos.component.scss']
})
export class ParqueaderosComponent implements OnInit {
  parqueaderos: Parqueadero[] = [];
  loading = false;
  idEmpresa: number | null = null;
  displayedColumns: string[] = ['id', 'nombre', 'ubicacion', 'capacidadTotal'];
  usuarioIsAdmin: boolean = false;

  constructor(
    private parqueaderosService: ParqueaderosService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerEmpresaUsuario();
    this.usuarioIsAdmin = this.authService.isAdministrador();
    if (this.idEmpresa) {
      this.cargarParqueaderos();
    }
  }

  private obtenerEmpresaUsuario(): void {
    const usuario = this.authService.getUsuarioActual();
    if (usuario && usuario.idEmpresa) {
      this.idEmpresa = usuario.idEmpresa;
    }
  }

  cargarParqueaderos(): void {
    if (!this.idEmpresa) return;
    
    this.loading = true;

    this.parqueaderosService.getByEmpresa(this.idEmpresa).subscribe({
      next: (data) => {
        this.parqueaderos = data;
        this.loading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.parqueaderos = [];
        } else {
          console.error('Error al cargar parqueaderos:', error);
        }
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {

    if (!this.idEmpresa) return;
    const dataEnviada: ParqueaderoDialogData = {
      idEmpresa: this.idEmpresa
    };


    const dialogRef = this.dialog.open(ParqueaderoModalComponent, {
      width: '500px',
      data: dataEnviada
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crearParqueadero(result);
      }
    });
  }

  crearParqueadero(datos: CrearParqueaderoDto): void {
      this.parqueaderosService.create(datos).subscribe({

        next: (parqueadero) => {
          this.parqueaderos = [...this.parqueaderos, parqueadero];
          console.log('Parqueadero creado');
        },
        
        error: (error) => {
          console.error('Error crear parqueaero', error);
        }
    });
  }
}