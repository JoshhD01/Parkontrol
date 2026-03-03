export interface OcupacionParqueadero {
  idParqueadero: number;
  nombreParqueadero: string;
  nombreEmpresa: string;
  totalCeldas: number;
  celdasOcupadas: number;
  celdasLibres: number;
}

export interface HistorialReserva {
  idReserva: number;
  placa: string;
  tipoVehiculo: string;
  idCelda: number;
  parqueadero: string;
  fechaEntrada: string;
  fechaSalida?: string;
  estado: string;
}

export interface FacturacionCompleta {
  idFacturaElectronica: number;
  tipoFactura?: 'NORMAL' | 'ELECTRONICA';
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  idPago: number;
  monto: number;
  metodoPago: string;
  fechaPago: string;
  cufe?: string | null;
  urlPdf?: string | null;
  enviada: boolean;
}

export interface IngresosMensuales {
  empresa: string;
  parqueadero: string;
  periodo: string;
  totalIngresos: number;
}

export interface VehiculoCompleto extends HistorialReserva {
  idVehiculo: number;
}