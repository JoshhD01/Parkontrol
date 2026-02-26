import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Reserva,
  CrearReservaDto,
  CrearReservaClienteDto,
} from '../models/reserva.model';
import { Vehiculo } from '../models/vehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private readonly apiUrl = `${environment.urlApi}/reservations`;

  constructor(private http: HttpClient) {}

  getByParqueadero(idParqueadero: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/parqueadero/${idParqueadero}`);
  }

  create(reservaData: CrearReservaDto): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reservaData);
  }

  finalizar(idReserva: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${idReserva}/finalizar`, {});
  }

  getActivas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/activas`);
  }

  getMisReservasCliente(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/client/mias`);
  }

  getMisVehiculosCliente(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.apiUrl}/client/vehiculos`);
  }

  crearComoCliente(reservaData: CrearReservaClienteDto): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/client`, reservaData);
  }
}