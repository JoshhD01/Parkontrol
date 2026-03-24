import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'VW_HISTORIAL_RESERVAS',
  synchronize: false,
})
export class HistorialReservasView {
  @ViewColumn({ name: 'ID_RESERVA' })
  idReserva: number;

  @ViewColumn({ name: 'PLACA' })
  placa: string;

  @ViewColumn({ name: 'TIPO_VEHICULO' })
  tipoVehiculo: string;

  @ViewColumn({ name: 'ID_CELDA' })
  idCelda: number;

  @ViewColumn({ name: 'PARQUEADERO' })
  parqueadero: string;

  @ViewColumn({ name: 'FECHA_ENTRADA' })
  fechaEntrada: Date;

  @ViewColumn({ name: 'FECHA_SALIDA' })
  fechaSalida: Date;

  @ViewColumn({ name: 'ESTADO' })
  estado: string;
}
