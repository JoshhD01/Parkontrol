import { Component, OnInit } from '@angular/core';
import { CeldasService } from '../../services/celdas.service';
import { ParqueaderosService } from '../../services/parqueaderos.service';
import { AuthService } from '../../services/autenticacion.service';
import { Celda } from '../../models/celda.model';
import { Parqueadero } from '../../models/parqueadero.model';
import { CeldaModalComponent, CeldaDialogData } from '../../components/celda-modal/celda-modal.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { EstadoCelda } from '../../models/shared.model';
import { FiltroParqueaderosComponent } from '../../components/filtro-parqueaderos/filtro-parqueaderos.component';
import { Usuario } from '../../models/usuario.model';





@Component({
  selector: 'app-celdas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    FiltroParqueaderosComponent
  ],
  templateUrl: './celdas.component.html',
  styleUrls: ['./celdas.component.scss']
})
export class CeldasComponent implements OnInit {

  celdas: Celda[] = [];
  parqueaderos: Parqueadero[] = [];
  celdasFiltradas: Celda[] = [];
  parqueaderoSeleccionado: number | null = null;
  estadoFiltro: string = '';
  usuarioIsAdmin: boolean = false;
  loading = false;
  errorMessage = '';

  estadosCeldas = [
    { valor: EstadoCelda.LIBRE, nombre: 'Libre' },
    { valor: EstadoCelda.OCUPADA, nombre: 'Ocupada' },
  ];

  displayedColumns: string[] = ['id', 'estado', 'tipoCelda', 'sensor', 'acciones'];

  constructor(
    private celdasService: CeldasService,
    private parqueaderosService: ParqueaderosService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarParqueaderos();
  }

  private cargarParqueaderos(): void {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario || !usuario.idEmpresa) {
      console.error('No hay usuario autenticado');
      return;
    }

    this.usuarioIsAdmin = this.authService.isAdministrador();
    this.loading = true;

    this.parqueaderosService.getByEmpresa(usuario.idEmpresa).subscribe({
      next: (parqueaderos) => {
        this.parqueaderos = parqueaderos;
        
        if (parqueaderos.length > 0) {
          this.parqueaderoSeleccionado = parqueaderos[0].id;
          this.cargarCeldas(this.parqueaderoSeleccionado);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error cargando los parqueaderos', error);
        this.loading = false;
      }
    });
  }

  private cargarCeldas(idParqueadero: number): void {

    this.loading = true;

    this.celdasService.getByParqueadero(idParqueadero).subscribe({
      next: (celdas) => {
        this.celdas = celdas;
        this.aplicarFiltroEstado();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error no cargaronlas celdas', error);
        this.celdas = [];
        this.celdasFiltradas = [];
        this.loading = false;
      }
    });
  }

  onParqueaderoCambia(idParqueadero: number): void {
    this.parqueaderoSeleccionado = idParqueadero;
    this.estadoFiltro = '';
    this.cargarCeldas(idParqueadero);
    console.log('celdas obtenidas', {...this.celdas});
  }

  onEstadoFiltroChange(estado: string): void {
    this.estadoFiltro = estado;
    this.aplicarFiltroEstado();
  }

  private aplicarFiltroEstado(): void {
    if (!this.estadoFiltro) {
      this.celdasFiltradas = [...this.celdas];
    } else {
      this.celdasFiltradas = this.celdas.filter(c => c.estado === this.estadoFiltro);
    }
  }

  abrirModalCrear(): void {
    const dialogData: CeldaDialogData = {
      parqueaderos: this.parqueaderos
    };

    const dialogRef = this.dialog.open(CeldaModalComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crearCelda(result);
      }
    });
  }

  private crearCelda(celdaData: any): void {
    this.celdasService.create(celdaData).subscribe({
      next: () => {
        console.log('Celda creada exitosamente');
        if (this.parqueaderoSeleccionado) {
          this.cargarCeldas(this.parqueaderoSeleccionado);
        }
      },
      error: (error) => {
        console.error('Error al crear celda:', error);
        
        if (error.status === 404 && error.error?.message) {
          if (error.error.message.includes('tipo')) {
            this.errorMessage = 'No existe el tipo de celda con el id ingresado';
          } else if (error.error.message.includes('sensor')) {
            this.errorMessage = 'No existe el sensor con id ingresado';
          } else {
            this.errorMessage = 'Error al crear la celda';
          }
        } else {
          this.errorMessage = 'Error al crear la celda';
        }
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
  

  cambiarEstado(celda: Celda, nuevoEstado: string): void {
    this.celdasService.updateEstado(celda.id, nuevoEstado).subscribe({
      next: () => {
        console.log('Estado actualizado exitosamente');
        if (this.parqueaderoSeleccionado) {
          this.cargarCeldas(this.parqueaderoSeleccionado);
        }
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
      }
    });
  }


}