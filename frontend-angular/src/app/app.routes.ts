import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './guards/autenticacion.guard';
import { roleGuard } from './guards/rol.guard';
import { clienteGuard } from './guards/cliente.guard';
import { RolUsuario } from './models/shared.model';

export const routes: Routes = [

  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },


  { 
    path: 'registro', 
    loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent)
  },

  {
    path: 'cliente-dashboard',
    canActivate: [clienteGuard],
    loadComponent: () => import('./pages/cliente-dashboard/cliente-dashboard.component').then(m => m.ClienteDashboardComponent),
  },

  
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR] }
      },

      {
        path: 'operador-dashboard',
        loadComponent: () => import('./pages/operador-dashboard/operador-dashboard.component').then(m => m.OperadorDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.OPERADOR] }
      },
      {
        path: 'parqueaderos',
        loadComponent: () => import('./pages/parqueaderos/parqueaderos.component').then(m => m.ParqueaderosComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR, RolUsuario.OPERADOR] }
      },

      {
        path: 'celdas',
        loadComponent: () => import('./pages/celdas/celdas.component').then(m => m.CeldasComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR, RolUsuario.OPERADOR] }
      },
      {
        path: 'vehiculos',
        loadComponent: () => import('./pages/vehiculos/vehiculos.component').then(m => m.VehiculosComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR, RolUsuario.OPERADOR] }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR] }
      },
      {
        path: 'tarifas',
        loadComponent: () => import('./pages/tarifas/tarifas.component').then(m => m.TarifasComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR] }
      },

      {

        path: 'reservas',
        loadComponent: () => import('./pages/reservas/reservas.component').then(m => m.ReservasComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR, RolUsuario.OPERADOR] }
      },
      {
        path: 'pagos',
        loadComponent: () => import('./pages/pagos/pagos.component').then(m => m.PagosComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR] }
      },
      {
        path: 'facturacion',
        loadComponent: () => import('./pages/facturacion/facturacion.component').then(m => m.FacturacionComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR] }
      },

      {
        path: 'vistas',
        loadComponent: () => import('./pages/vistas/vistas.component').then(m => m.VistasComponent),
        canActivate: [roleGuard],
        data: { roles: [RolUsuario.ADMINISTRADOR] }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }

    ]
  },
  
  { path: '**', redirectTo: '/dashboard' }
];
