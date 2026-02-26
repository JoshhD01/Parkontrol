import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Parqueadero } from 'src/parqueaderos/entities/parqueadero.entity';
import { Periodo } from 'src/shared/entities/periodo.entity';

@Entity('REPORTE')
export class Reporte {
  @PrimaryGeneratedColumn({ name: 'ID_REPORTE' })
  id: number;

  @Column({ name: 'URL_ARCHIVO', length: 255, nullable: true })
  urlArchivo: string;

  @ManyToOne(() => Parqueadero, { nullable: false })
  @JoinColumn({ name: 'ID_PARQUEADERO' })
  parqueadero: Parqueadero;

  @ManyToOne(() => Periodo, { nullable: false })
  @JoinColumn({ name: 'ID_PERIODO' })
  periodo: Periodo;
}
