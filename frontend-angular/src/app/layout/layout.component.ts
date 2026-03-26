import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../services/autenticacion.service';
import { MenuService, ElementoMenu } from '../services/menu.service';
import { Usuario } from '../models/usuario.model';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  usuarioActual: Usuario | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly menuService: MenuService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getUsuarioActual();
  }

  get elementosMenuFiltrados(): ElementoMenu[] {
    if (!this.usuarioActual) return [];
    
    return this.menuService.obtenerMenuPorRol(this.usuarioActual.rol);
  }

  obtenerTituloPagina(): string {
    const url = this.router.url;
    return this.menuService.obtenerEtiquetaPorRuta(url);
  }

  Onlogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}