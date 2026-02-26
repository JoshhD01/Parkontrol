import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('PERIODO')
export class Periodo {
  @PrimaryGeneratedColumn({ name: 'ID_PERIODO' })
  id: number;

  @Column({ name: 'NOMBRE', length: 20, nullable: false })
  nombre: string;
}
