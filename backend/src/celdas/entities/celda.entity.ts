import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Parqueadero } from 'src/parqueaderos/entities/parqueadero.entity';
import { TipoCelda } from 'src/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/shared/entities/sensor.entity';

@Entity('CELDA')
export class Celda {
  @PrimaryGeneratedColumn({ name: 'ID_CELDA' })
  id: number;

  @Column({ name: 'ESTADO', length: 20, nullable: false })
  estado: string;

  @Column({ name: 'ULTIMO_CAMBIO_ESTADO', type: 'timestamp', nullable: true })
  ultimoCambioEstado: Date;

  @ManyToOne(() => Parqueadero, { nullable: false })
  @JoinColumn({ name: 'ID_PARQUEADERO' })
  parqueadero: Parqueadero;

  @ManyToOne(() => TipoCelda, { nullable: false })
  @JoinColumn({ name: 'ID_TIPO_CELDA' })
  tipoCelda: TipoCelda;

  @ManyToOne(() => Sensor, { nullable: false })
  @JoinColumn({ name: 'ID_SENSOR' })
  sensor: Sensor;
}
