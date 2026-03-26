import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Celda, CrearCeldaDto } from '../models/celda.model';

@Injectable({
  providedIn: 'root'
})
export class CeldasService {
  private readonly apiUrl = environment.urlApi;

  constructor(private readonly http: HttpClient) {}

  create(data: CrearCeldaDto): Observable<Celda> {
    return this.http.post<Celda>(`${this.apiUrl}/cells`, data);
  }

  getByParqueadero(idParqueadero: number): Observable<Celda[]> {
    return this.http.get<Celda[]>(`${this.apiUrl}/cells/parqueadero/${idParqueadero}`);
  }

  getById(id: number): Observable<Celda> {
    return this.http.get<Celda>(`${this.apiUrl}/cells/${id}`);
  }

  updateEstado(id: number, estado: string): Observable<Celda> {
    return this.http.patch<Celda>(`${this.apiUrl}/cells/${id}/estado`, { estado });
  }
}