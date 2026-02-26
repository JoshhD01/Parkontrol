import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pago, CrearPagoDto } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private apiUrl = environment.urlApi;

  constructor(private http: HttpClient) {}

  create(data: CrearPagoDto): Observable<Pago> {
    return this.http.post<Pago>(`${this.apiUrl}/payments`, data);
  }

  getById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/payments/${id}`);
  }

  getByReserva(idReserva: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/payments/reserva/${idReserva}`);
  }

  getByParqueadero(idParqueadero: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/payments/parqueadero/${idParqueadero}`);
  }

  getMisPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/payments/client/mis-pagos`);
  }
}