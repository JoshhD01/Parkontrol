import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CrearFacturaElectronicaDto } from '../../models/facturacion.model';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FacturacionCompleta } from '../../models/vistas.model';
import { FacturaModalComponent } from '../factura-modal/factura-modal.component';

@Component({
  selector: 'app-facturas-lista',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, CommonModule, MatDialogModule],
  templateUrl: './facturas-lista.component.html',
  styleUrls: ['./facturas-lista.component.scss']
})
export class FacturasListaComponent {
  @Input() facturas: FacturacionCompleta[] = [];
  @Input() idEmpresa: number | null = null;
  @Input() clientes: any[] = [];
  @Output() crearFactura = new EventEmitter<CrearFacturaElectronicaDto>();

  displayedColumns = ['id', 'idPago', 'idClienteFactura', 'cufe', 'enviada', 'fechaEmision'];

  constructor(private dialog: MatDialog) {}

  abrirModalNuevaFactura(): void {
    const dialogRef = this.dialog.open(FacturaModalComponent, {
      width: '600px',
      data: { idEmpresa: this.idEmpresa, clientes: this.clientes }
    });

    dialogRef.afterClosed().subscribe((result: CrearFacturaElectronicaDto | undefined) => {
      if (result) {
        this.crearFactura.emit(result);
      }
    });
  }
}
