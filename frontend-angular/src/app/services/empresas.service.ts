import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Empresa } from '../models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  private readonly apiUrl = environment.urlApi;

  constructor(private readonly http: HttpClient) {}


  getById(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/companies/${id}`);
  }


}