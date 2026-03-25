import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('TIPO_VEHICULO')
export class TipoVehiculo {
  @PrimaryGeneratedColumn({ name: 'ID_TIPO_VEHICULO' })
  id: number;

  @Column({ name: 'NOMBRE', length: 50, nullable: false })
  nombre: string;
}
