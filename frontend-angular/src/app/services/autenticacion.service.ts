import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { RolUsuario } from '../models/shared.model';
import { 
  Usuario, 
  LoginUsuarioDto, 
  LoginResponseDto, 
  RegistrarClienteDto,
  RegistroClienteResponse,
  TipoAccesoLogin,
} from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.urlApi;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  register(userData: RegistrarClienteDto): Observable<RegistroClienteResponse> {
    return this.http.post<RegistroClienteResponse>(
      `${this.apiUrl}/auth/register-client`,
      userData,
    );
  }

  login(credentials: LoginUsuarioDto): Observable<LoginResponseDto> {
    return this.loginByAccess(credentials, credentials.tipoAcceso ?? 'CLIENTE');
  }

  loginByAccess(
    credentials: Omit<LoginUsuarioDto, 'tipoAcceso'>,
    tipoAcceso: TipoAccesoLogin,
  ): Observable<LoginResponseDto> {
    const payload: LoginUsuarioDto = {
      ...credentials,
      tipoAcceso,
    };

    return this.http.post<LoginResponseDto>(`${this.apiUrl}/auth/login`, payload)
      .pipe(
        tap(response => {
          if (response.access_token) {
            localStorage.setItem(this.TOKEN_KEY, response.access_token);
          }
        })
      );
  }


  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpirado(token);
  }

  getUsuarioActual(): Usuario | null {
    const token = this.getToken();
    if (token && !this.isTokenExpirado(token)) {
      return this.obtenerUsuarioFromToken(token);
    }
    return null;
  }

  tieneRole(role: string): boolean {
    const user = this.getUsuarioActual();
    return user ? user.rol === role : false;
  }

  isAdministrador(): boolean {
    return this.tieneRole(RolUsuario.ADMINISTRADOR);
  }

  isOperador(): boolean {
    return this.tieneRole(RolUsuario.OPERADOR);
  }

  isCliente(): boolean {
    return this.tieneRole(RolUsuario.CLIENTE);
  }

  private obtenerUsuarioFromToken(token: string): Usuario | null {
    try {
      const payload: any = jwtDecode(token);
      
      const usuario: Usuario = {
        id: payload.id,
        nombre: '',
        correo: payload.correo,
        rol: payload.nombreRol,
        idEmpresa: payload.idEmpresa
      };

      return usuario;
    } catch (error) {
      console.error('Error obteniendo payload', error);
      return null;
    }
  }

  private isTokenExpirado(token: string): boolean {
    try {
      const payload: any = jwtDecode(token);
  
      if (!payload.exp) {
        return false;
      }
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  }
}