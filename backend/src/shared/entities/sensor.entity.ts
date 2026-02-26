import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('SENSOR')
export class Sensor {
  @PrimaryGeneratedColumn({ name: 'ID_SENSOR' })
  id: number;

  @Column({ name: 'DESCRIPCION', length: 100, nullable: true })
  descripcion: string;
}
