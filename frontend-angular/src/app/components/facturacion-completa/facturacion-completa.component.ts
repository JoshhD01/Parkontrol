import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FacturacionCompleta } from '../../models/vistas.model';

@Component({
  selector: 'app-facturacion-completa',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './facturacion-completa.component.html',
  styleUrl: './facturacion-completa.component.scss'
})
export class FacturacionCompletaComponent {
  @Input() facturacionData: FacturacionCompleta[] = [];
  @Input() loading: boolean = false;

  displayedColumns: string[] = [
    'tipoFactura',
    'cufe',
    'numeroDocumento',
    'correoCliente',
    'monto',
    'fechaPago',
    'enviada'
  ];
}