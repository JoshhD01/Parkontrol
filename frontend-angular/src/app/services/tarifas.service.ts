import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tarifa, CrearTarifaDto, ActualizarTarifaDto } from '../models/tarifa.model';

@Injectable({
  providedIn: 'root'
})
export class TarifasService {
  private readonly apiUrl = environment.urlApi;

  constructor(private readonly http: HttpClient) {}

  create(data: CrearTarifaDto): Observable<Tarifa> {
    return this.http.post<Tarifa>(`${this.apiUrl}/rates`, data);
  }
  

  getByParqueadero(idParqueadero: number): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.apiUrl}/rates/parqueadero/${idParqueadero}`);
  }


  getById(id: number): Observable<Tarifa> {
    return this.http.get<Tarifa>(`${this.apiUrl}/rates/${id}`);
  }

  update(id: number, data: ActualizarTarifaDto): Observable<Tarifa> {
    return this.http.patch<Tarifa>(`${this.apiUrl}/rates/${id}`, data);
  }


}