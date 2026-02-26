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
}


export interface CrearReservaDto {
  idVehiculo: number;
  idCelda: number;
  estado: string;
  idClienteFactura?: number;
}