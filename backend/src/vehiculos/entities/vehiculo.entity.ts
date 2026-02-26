import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TipoVehiculo } from 'src/shared/entities/tipo-vehiculo.entity';

@Entity('VEHICULO')
export class Vehiculo {
  @PrimaryGeneratedColumn({ name: 'ID_VEHICULO' })
  id: number;

  @Column({ name: 'PLACA', length: 10, unique: true, nullable: false })
  placa: string;

  @ManyToOne(() => TipoVehiculo, { nullable: false })
  @JoinColumn({ name: 'ID_TIPO_VEHICULO' })
  tipoVehiculo: TipoVehiculo;
}
