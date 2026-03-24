import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'VW_OCUPACION_PARQUEADERO',
  synchronize: false,
})
export class OcupacionParqueaderoView {
  @ViewColumn({ name: 'ID_PARQUEADERO' })
  idParqueadero: number;

  @ViewColumn({ name: 'NOMBRE_PARQUEADERO' })
  nombreParqueadero: string;

  @ViewColumn({ name: 'NOMBRE_EMPRESA' })
  nombreEmpresa: string;

  @ViewColumn({ name: 'TOTAL_CELDAS' })
  totalCeldas: number;

  @ViewColumn({ name: 'CELDAS_OCUPADAS' })
  celdasOcupadas: number;

  @ViewColumn({ name: 'CELDAS_LIBRES' })
  celdasLibres: number;
}
