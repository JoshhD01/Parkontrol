import { RolUsuario } from './shared.model';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  idEmpresa: number;
}

export interface LoginUsuarioDto {
  correo: string;
  contrasena: string;
  tipoAcceso?: TipoAccesoLogin;
}

export type TipoAccesoLogin = 'CLIENTE' | 'ADMIN' | 'OPERADOR';

export interface LoginResponseDto {
  access_token: string;
}

export interface CreateUsuarioDto {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string; // Rol del usuario
  idEmpresa: number; // ID de la empresa
}

export interface RegistrarClienteDto {
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  contrasena: string;
}

export interface RegistroClienteResponse {
  idClienteFactura: number;
  correo: string;
}