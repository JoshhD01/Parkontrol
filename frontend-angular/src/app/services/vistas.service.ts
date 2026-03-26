import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  OcupacionParqueadero, 
  HistorialReserva, 
  FacturacionCompleta, 
  IngresosMensuales 
} from '../models/vistas.model';

@Injectable({
  providedIn: 'root'
})
export class VistasService {
  private readonly apiUrl = environment.urlApi;

  constructor(private readonly http: HttpClient) {}

  getOcupacion(idEmpresa?: number): Observable<OcupacionParqueadero[]> {
    const params = idEmpresa ? `?idEmpresa=${idEmpresa}` : '';
    return this.http.get<OcupacionParqueadero[]>(`${this.apiUrl}/views/ocupacion${params}`);
  }

  getHistorialReservas(idEmpresa?: number): Observable<HistorialReserva[]> {
    const params = idEmpresa ? `?idEmpresa=${idEmpresa}` : '';
    return this.http.get<HistorialReserva[]>(`${this.apiUrl}/views/historial-reservas${params}`);
  }

  getFacturacion(idEmpresa?: number): Observable<FacturacionCompleta[]> {
    const params = idEmpresa ? `?idEmpresa=${idEmpresa}` : '';
    return this.http
      .get<any[]>(`${this.apiUrl}/views/facturacion${params}`)
      .pipe(
        map((rows) =>
          (rows ?? []).map((row) => {
            const rawCufe = row?.cufe ?? null;
            const normalFromPrefix =
              typeof rawCufe === 'string' && rawCufe.startsWith('NF-');
            const tipoFactura =
              row?.tipoFactura ?? (normalFromPrefix ? 'NORMAL' : 'ELECTRONICA');

            let enviada = false;
            if (typeof row?.enviada === 'boolean') {
              enviada = row.enviada;
            } else if (typeof row?.enviada === 'string') {
              enviada = row.enviada.toUpperCase() === 'Y';
            } else if (typeof row?.enviada === 'number') {
              enviada = row.enviada === 1;
            }

            return {
              ...row,
              tipoFactura,
              cufe: tipoFactura === 'ELECTRONICA' ? rawCufe : null,
              enviada: tipoFactura === 'ELECTRONICA' ? enviada : false,
            } as FacturacionCompleta;
          }),
        ),
      );
  }

  getIngresos(idEmpresa?: number): Observable<IngresosMensuales[]> {
    const params = idEmpresa ? `?idEmpresa=${idEmpresa}` : '';
    return this.http.get<IngresosMensuales[]>(`${this.apiUrl}/views/ingresos${params}`);
  }
}