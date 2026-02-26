import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/autenticacion.service';
import { RolUsuario } from '../models/shared.model';

export const clienteGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const usuario = authService.getUsuarioActual();
  if (usuario?.rol === RolUsuario.CLIENTE) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
