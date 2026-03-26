import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Reserva } from '../../models/reserva.model';

@Component({
  selector: 'app-reservas-activas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './reservas-activas.component.html',
  styleUrls: ['./reservas-activas.component.scss']
})
export class ReservasActivasComponent {
  @Input() reservasActivas: Reserva[] = [];
  @Input() loading: boolean = false;
  @Input() showActions = false;
  @Input() emptyMessage = 'No hay reservas activas para mostrar.';
  @Output() finalizarReserva = new EventEmitter<Reserva>();

  get displayedColumns(): string[] {
    const base = ['id', 'vehiculo', 'fechaEntrada', 'fechaSalida', 'estado'];
    return this.showActions ? [...base, 'acciones'] : base;
  }

  onFinalizar(reserva: Reserva): void {
    this.finalizarReserva.emit(reserva);
  }
}