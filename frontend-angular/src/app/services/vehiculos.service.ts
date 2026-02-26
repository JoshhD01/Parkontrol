import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo, CrearVehiculoDto } from '../models/vehiculo.model';
import { Reserva } from '../models/reserva.model';
import { TipoVehiculo } from '../models/shared.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private readonly apiUrl = `${environment.urlApi}/vehicles`;

  constructor(private http: HttpClient) {}

  getByPlaca(placa: string): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/placa/${placa}`);
  }

  create(vehiculoData: CrearVehiculoDto): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculoData);
  }


  getById(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  getHistorialReservas(idVehiculo: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/${idVehiculo}/reservas`);
  }

  getTiposVehiculo(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(`${this.apiUrl}/tipos`);
  }
}
