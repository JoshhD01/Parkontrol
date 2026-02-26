import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Parqueadero, CrearParqueaderoDto } from '../models/parqueadero.model';

@Injectable({
  providedIn: 'root'
})
export class ParqueaderosService {
  private apiUrl = environment.urlApi;

  constructor(private http: HttpClient) {}

  create(data: CrearParqueaderoDto): Observable<Parqueadero> {
    return this.http.post<Parqueadero>(`${this.apiUrl}/parking-lots`, data);
  }

  getByEmpresa(idEmpresa: number): Observable<Parqueadero[]> {
    return this.http.get<Parqueadero[]>(`${this.apiUrl}/parking-lots/empresa/${idEmpresa}`);
  }

  getById(id: number): Observable<Parqueadero> {
    return this.http.get<Parqueadero>(`${this.apiUrl}/parking-lots/${id}`);
  }

  getDisponiblesCliente(): Observable<Parqueadero[]> {
    return this.http.get<Parqueadero[]>(
      `${this.apiUrl}/parking-lots/client/disponibles`,
    );
  }
}