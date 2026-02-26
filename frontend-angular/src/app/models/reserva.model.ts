import { Celda } from './celda.model';
import { Vehiculo } from './vehiculo.model';

export interface Reserva {
  id: number;
  idCelda: number;
  idVehiculo: number;
  fechaEntrada: string;
  fechaSalida?: string;
  estado: string;
  monto?: number;
  celda?: Celda;
  vehiculo?: Vehiculo;
  clienteFactura?: { id: number; correo: string };
}


export interface CrearReservaDto {
  idVehiculo: number;
  idCelda: number;
  estado: string;
  idClienteFactura?: number;
  horaInicio: string;
  horaFin: string;
}

export interface CrearReservaClienteDto {
  idParqueadero: number;
  placa: string;
  idTipoVehiculo: 1 | 2;
  horaInicio: string;
  horaFin: string;
}