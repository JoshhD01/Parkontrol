import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './autenticacion.service';
import { ParqueaderosService } from './parqueaderos.service';
import { Parqueadero } from '../models/parqueadero.model';

@Injectable({ providedIn: 'root' })
export class CompanyContextService {
  constructor(
    private readonly authService: AuthService,
    private readonly parqueaderosService: ParqueaderosService,
  ) {}

  getCurrentEmpresaId(): number | null {
    return this.authService.getUsuarioActual()?.idEmpresa ?? null;
  }

  getParqueaderosEmpresaActual(): Observable<Parqueadero[]> {
    const idEmpresa = this.getCurrentEmpresaId();
    if (!idEmpresa) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    return this.parqueaderosService.getByEmpresa(idEmpresa).pipe(
      catchError((error) => {
        if (error?.status === 404) {
          return of([]);
        }
        return throwError(() => error);
      }),
    );
  }
}
