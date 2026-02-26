export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  OPERADOR = 'OPERADOR',
  CLIENTE = 'CLIENTE',
}


export interface Empresa {
  id: number;
  nombre: string;
}


export interface TipoVehiculo {
  id: number;
  nombre: string;
}


export interface TipoCelda {
  id: number;
  nombre: string;
}

export enum EstadoCelda {
  LIBRE = 'LIBRE',
  OCUPADA = 'OCUPADA'
}

export enum EstadoReserva {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
}

export interface Sensor {
  id: number;
  codigo: string;
  tipo: string;
}



export interface Periodo {
  id: number;
  nombre: string;
}

export interface MetodoPago {
  id: number;
  nombre: string;
}