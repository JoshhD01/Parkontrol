import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../../services/reservas.service';
import { Reserva } from '../../models/reserva.model';
import { Parqueadero } from '../../models/parqueadero.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FiltroParqueaderosComponent } from '../../components/filtro-parqueaderos/filtro-parqueaderos.component';
import { ReservaModalComponent, ReservaDialogData } from '../../components/reserva-modal/reserva-modal.component';
import { PagoModalComponent, PagoDialogData } from '../../components/pago-modal/pago-modal.component';
import { PagosService } from '../../services/pagos.service';
import { FacturacionService } from '../../services/facturacion.service';
import { CrearPagoDto, Pago } from '../../models/pago.model';
import { ReservasActivasComponent } from '../../components/reservas-activas/reservas-activas.component';
import { CompanyContextService } from '../../services/company-context.service';


@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    FiltroParqueaderosComponent,
    ReservasActivasComponent,
  ],
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.scss']
})
export class ReservasComponent implements OnInit {
  
  reservas: Reserva[] = [];
  parqueaderos: Parqueadero[] = [];
  loading = false;
  parqueaderoSeleccionado: number | null = null;
  errorMessage = '';
  mensajeExito: string = '';


  constructor(
    private readonly reservasService: ReservasService,
    private readonly companyContextService: CompanyContextService,
    private readonly pagosService: PagosService,
    private readonly facturacionService: FacturacionService,
    private readonly dialog: MatDialog,

  ) {}

  ngOnInit(): void {
    this.cargarParqueaderos();
  }

  private cargarParqueaderos(): void {
    this.loading = true;

    this.companyContextService.getParqueaderosEmpresaActual().subscribe({
      next: (parqueaderos) => {
        this.parqueaderos = parqueaderos;

        if (parqueaderos.length > 0) {
          this.parqueaderoSeleccionado = parqueaderos[0].id;
          this.cargarReservas(this.parqueaderoSeleccionado);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error No cargo parqueaderos', error);
        this.parqueaderos = [];
        this.loading = false;
      },
    });
  }


  private cargarReservas(idParqueadero: number): void {
    this.loading = true;

    this.reservasService.getByParqueadero(idParqueadero).subscribe({

      next: (reservas) => {
        this.reservas = reservas;
        this.loading = false;
      },
      error: (error) => {
        if (error?.status !== 404) {
          console.error('no cargo reservas', error);
        }
        this.reservas = [];
        this.loading = false;
      }
    });
  }

  onParqueaderoCambia(idParqueadero: number): void {
    this.parqueaderoSeleccionado = idParqueadero;
    this.cargarReservas(idParqueadero);
  }

  abrirModalCrear(): void {
    if (!this.parqueaderoSeleccionado) return;

    const dataParqueadero: ReservaDialogData = {
      idParqueadero: this.parqueaderoSeleccionado
    };


    const dialogRef = this.dialog.open(ReservaModalComponent, {
      width: '600px',
      data: dataParqueadero,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.parqueaderoSeleccionado) {
          this.cargarReservas(this.parqueaderoSeleccionado);
        }
      }
    });
  }

  finalizarReserva(reserva: Reserva): void {
    const dialogData: PagoDialogData = {
      idReserva: reserva.id
    };

    const dialogRef = this.dialog.open(PagoModalComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.procesarPago(result);
      }
    });
  }

  private procesarPago(pagoData: CrearPagoDto): void {
    this.pagosService.create(pagoData).subscribe({
      
      next: (pago: Pago) => {
        this.facturacionService.crearFactura({ idPago: pago.id }).subscribe({
          next: () => {
            this.mensajeExito = "Pago y factura creados exitosamente, monto: $" + pago.monto;
            setTimeout(() => {
              this.mensajeExito = '';
            }, 3000);
            if (this.parqueaderoSeleccionado) {
              this.cargarReservas(this.parqueaderoSeleccionado);
            }
          },
          error: () => {
            this.mensajeExito = "Pago procesado exitosamente, monto: $" + pago.monto;
            this.errorMessage = 'Pago creado, pero no se pudo generar la factura.';
            setTimeout(() => {
              this.mensajeExito = '';
              this.errorMessage = '';
            }, 4000);
            if (this.parqueaderoSeleccionado) {
              this.cargarReservas(this.parqueaderoSeleccionado);
            }
          },
        });
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        console.error('Error al procesar pago:', error);

        if (error.status === 400) {
          if (error.error?.message?.includes('ABIERTA')) {
            this.errorMessage = 'La reserva debe estar ABIERTA para iniciar pago.';
          } else if (error.error?.message?.includes('existe un pago')) {
            this.errorMessage = 'Ya existe un pago registrado para esta reserva.';
          } else if (error.error?.message?.includes('No existe método de pago')) {
            this.errorMessage = `No existe un metodo pago con el Id`;
          } else if (error.error?.message?.includes('tarifa')) {
            this.errorMessage = 'No existe una tarifa para el parqueadero segun tipo vehiculo.';
          } 
        } else if (error.status === 404) {
            if (error.error?.message?.includes('método de pago')) {
              this.errorMessage = `No existe un metodo pago con el Id ingresado`;
            }
        } else {
          this.errorMessage = 'Error no pudo procesar el pago.';
        }

        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      }
    });
  }
}