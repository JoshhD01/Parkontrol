import { Component, OnInit } from '@angular/core';
import { TarifasService } from '../../services/tarifas.service';
import { ParqueaderosService } from '../../services/parqueaderos.service';
import { AuthService } from '../../services/autenticacion.service';
import { Tarifa } from '../../models/tarifa.model';
import { Parqueadero } from '../../models/parqueadero.model';
import { TarifaModalComponent, TarifaDialogData } from '../../components/tarifa-modal/tarifa-modal.component';
import { CommonModule } from '@angular/common';
import { FiltroParqueaderosComponent } from '../../components/filtro-parqueaderos/filtro-parqueaderos.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';


@Component({
  selector: 'app-tarifas',
  standalone: true,
  imports: [

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
  templateUrl: './tarifas.component.html',
  styleUrls: ['./tarifas.component.scss']
})
export class TarifasComponent implements OnInit {

  tarifas: Tarifa[] = [];
  parqueaderos: Parqueadero[] = [];
  loading = false;
  parqueaderoSeleccionado: number | null = null;
  errorMessage = '';

  displayedColumns: string[] = ['id', 'idParqueadero', 'idTipoVehiculo', 'precioFraccionHora', 'precioHoraAdicional', 'acciones'];

  constructor(
    private tarifasService: TarifasService,
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

    this.loading = true;

    this.parqueaderosService.getByEmpresa(usuario.idEmpresa).subscribe({
      next: (parqueaderos) => {
        this.parqueaderos = parqueaderos;
        if (parqueaderos.length > 0) {
          this.parqueaderoSeleccionado = parqueaderos[0].id;
          this.cargarTarifas(this.parqueaderoSeleccionado);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        if (error?.status === 404) {
          this.parqueaderos = [];
        } else {
          console.error('Error cargando los parqueaderos', error);
        }
        this.loading = false;
      }
   
   
    });
  }


  private cargarTarifas(idParqueadero: number): void {

    this.loading = true;

    this.tarifasService.getByParqueadero(idParqueadero).subscribe({
      next: (tarifas) => {
        this.tarifas = tarifas;
        this.loading = false;
      },
      error: (error) => {
        if (error?.status !== 404) {
          console.error('Error no cargaron las tarifas', error);
        }
        this.tarifas = [];
        this.loading = false;
      }
    });
  }

  onParqueaderoCambia(idParqueadero: number): void {
    this.parqueaderoSeleccionado = idParqueadero;
    this.cargarTarifas(idParqueadero);
    console.log('tarifas obtenidas', {...this.tarifas});
  }

  abrirModalCrear(): void {
    const dialogData: TarifaDialogData = {
      parqueaderos: this.parqueaderos
    };
    const dialogRef = this.dialog.open(TarifaModalComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crearTarifa(result);
      }
    });
  }

  abrirModalEditar(tarifa: Tarifa): void {
    const dialogData: TarifaDialogData = {
      parqueaderos: this.parqueaderos,
      tarifa: tarifa
    };

    const dialogRef = this.dialog.open(TarifaModalComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarTarifa(tarifa.id, result);
      }
    });
  }

  private crearTarifa(tarifaData: any): void {
    this.tarifasService.create(tarifaData).subscribe({
      next: () => {
        console.log('Tarifa creada exitosamente');
        if (this.parqueaderoSeleccionado) {
          this.cargarTarifas(this.parqueaderoSeleccionado);
        }
      },
      error: (error) => {
        console.error('Error al crear tarifa:', error);
        if (error.status === 404 && error.error?.message) {
            this.errorMessage = 'No existe el tipo de vehiculo con el id ingresado';
          } else {
            this.errorMessage = 'Error al crear la tarifa';
          }
   

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  private actualizarTarifa(id: number, tarifaData: any): void {
    this.tarifasService.update(id, tarifaData).subscribe({
      next: () => {
        console.log('Tarifa actualizada exitosamente');
        if (this.parqueaderoSeleccionado) {
          this.cargarTarifas(this.parqueaderoSeleccionado);
        }
      },
      error: (error) => {
        console.error('Error al actualizar tarifa:', error);
        this.errorMessage = 'Error al actualizar la tarifa';
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
}