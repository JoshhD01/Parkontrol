import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'VW_INGRESOS_POR_PARQUEADERO_MENSUAL',
  synchronize: false,
})
export class IngresosPorParqueaderoMensualView {
  @ViewColumn({ name: 'EMPRESA' })
  empresa: string;

  @ViewColumn({ name: 'PARQUEADERO' })
  parqueadero: string;

  @ViewColumn({ name: 'PERIODO' })
  periodo: string;

  @ViewColumn({ name: 'TOTAL_INGRESOS' })
  totalIngresos: number;
}
