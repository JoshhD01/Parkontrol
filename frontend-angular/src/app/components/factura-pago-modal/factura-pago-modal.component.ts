import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FacturaElectronica } from '../../models/facturacion.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-factura-pago-modal',
  standalone: true,
  imports: [ 
    MatButtonModule,
    MatIconModule,
    MatDialogModule],
  templateUrl: './factura-pago-modal.component.html',
  styleUrls: ['./factura-pago-modal.component.scss']
})
export class FacturaPagoModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FacturaPagoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { factura: FacturaElectronica | null }
  ) {}

  ngOnInit(): void {
    this.data.factura ??= null;
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}