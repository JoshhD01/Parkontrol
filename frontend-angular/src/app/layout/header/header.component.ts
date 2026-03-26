import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() usuarioActual: Usuario | null = null;
  @Input() tituloPagina: string = 'Dashboard';
  
  @Output() cerrarSesionRequested = new EventEmitter<void>();

  cerrarSesion(): void {
    this.cerrarSesionRequested.emit();
  }
}