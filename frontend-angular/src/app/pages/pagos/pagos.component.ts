import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PagosService } from '../../services/pagos.service';
import { CrearPagoDto, Pago } from '../../models/pago.model';
import { Parqueadero } from '../../models/parqueadero.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FiltroParqueaderosComponent } from '../../components/filtro-parqueaderos/filtro-parqueaderos.component';
import { PagoModalComponent, PagoDialogData } from '../../components/pago-modal/pago-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FacturaPagoModalComponent } from '../../components/factura-pago-modal/factura-pago-modal.component';
import { FacturacionService } from '../../services/facturacion.service';
import { FacturaElectronica } from '../../models/facturacion.model';
import { CompanyContextService } from '../../services/company-context.service';


@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    FiltroParqueaderosComponent
  ],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss']
})
export class PagosComponent implements OnInit {
  pagos: Pago[] = [];
  parqueaderos: Parqueadero[] = [];
  loading = false;
  parqueaderoSeleccionado: number | null = null;
  errorMessage = '';
  mensajeExito: string = '';
  displayedColumns: string[] = ['id', 'idReserva', 'monto', 'fechaPago', 'idMetodoPago', 'acciones'];

  constructor(
    private readonly pagosService: PagosService,
    private readonly companyContextService: CompanyContextService,
    private readonly dialog: MatDialog,
    private readonly facturasService: FacturacionService,

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
          this.cargarPagos(this.parqueaderoSeleccionado);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error No cargo parqueaderos', error);
        this.parqueaderos = [];
        this.loading = false;
      }
    });
  }

  private cargarPagos(idParqueadero: number): void {
    this.loading = true;
    this.pagosService.getByParqueadero(idParqueadero).subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        this.loading = false;
      },
      error: (error) => {
        if (error?.status !== 404) {
          console.error('No se cargaron los pagos', error);
        }
        this.pagos = [];
        this.loading = false;
      }
    });
  }

  onParqueaderoCambia(idParqueadero: number): void {
    this.parqueaderoSeleccionado = idParqueadero;
    this.cargarPagos(idParqueadero);
  }

  abrirModalCrear(): void {
    if (!this.parqueaderoSeleccionado) return;
    const dialogData: PagoDialogData = {
      idParqueadero: this.parqueaderoSeleccionado
    };
    const dialogRef = this.dialog.open(PagoModalComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crearPago(result);
      }
    });
  }

  private crearPago(pagoData: CrearPagoDto): void {
    this.pagosService.create(pagoData).subscribe({
      next: (pago: Pago) => {
        this.facturasService.crearFactura({ idPago: pago.id }).subscribe({
          next: () => {
            this.mensajeExito = 'Pago y factura creados exitosamente, monto: $' + pago.monto;

            setTimeout(() => {
              this.mensajeExito = '';
              this.cargarPagos(this.parqueaderoSeleccionado!);
            }, 3000);
          },
          error: () => {
            this.mensajeExito = 'Pago procesado exitosamente, monto: $' + pago.monto;
            this.errorMessage = 'Pago creado, pero no se pudo generar la factura.';

            setTimeout(() => {
              this.mensajeExito = '';
              this.errorMessage = '';
              this.cargarPagos(this.parqueaderoSeleccionado!);
            }, 4000);
          },
        });
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        console.error('Error al crear pago:', error);
        this.errorMessage = 'Error al crear el pago.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      }
    });
  }

  verFactura(pago: Pago): void {
    this.abrirFactura(pago.id);
  }

  abrirFactura(pagoId: number): void {
    this.facturasService.getFacturaPorPago(pagoId).subscribe({
      next: (factura: FacturaElectronica) => {
        this.dialog.open(FacturaPagoModalComponent, {
          width: '400px',
          data: { factura }
        });
      },
      error: () => {
        this.dialog.open(FacturaPagoModalComponent, {
          width: '400px',
          data: { factura: null }
        });
      }
    });
  }
}