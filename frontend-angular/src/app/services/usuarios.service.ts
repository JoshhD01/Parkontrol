import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, CreateUsuarioDto } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly apiUrl = `${environment.urlApi}/users`;

  constructor(private http: HttpClient) {}

  getByEmpresa(idEmpresa: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/empresa/${idEmpresa}`);
  }

  create(dto: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cambiarContrasena(data: { contrasenaActual: string; nuevaContrasena: string }): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/cambiar-contrasena`, data);
  }
}
