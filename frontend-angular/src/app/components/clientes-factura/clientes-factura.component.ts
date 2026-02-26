import { Component, Input } from '@angular/core';
import { ClienteFactura } from '../../models/facturacion.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ClienteFacturaModalComponent } from '../modal-nuevo-cliente/modal-nuevo-cliente.component';
import { CrearClienteFacturaDto } from '../../models/facturacion.model';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-clientes-factura',
  standalone: true,
  imports: [ MatTableModule, MatButtonModule],
  templateUrl: './clientes-factura.component.html',
  styleUrls: ['./clientes-factura.component.scss']
})
export class ClientesFacturaComponent {
  @Input() clientes: ClienteFactura[] = [];
  @Output() clienteCreado = new EventEmitter<CrearClienteFacturaDto>();
  displayedColumns = ['id', 'tipoDocumento', 'numeroDocumento', 'correo'];

  constructor(private dialog: MatDialog) {}

  abrirModalNuevoCliente(): void {
    const dialogRef = this.dialog.open(ClienteFacturaModalComponent, {
      width: '500px',
      data: {}
    });
    dialogRef.afterClosed().subscribe((result: CrearClienteFacturaDto | undefined) => {
      if (result) {
        this.clienteCreado.emit(result);
      }
    });
  }
}
