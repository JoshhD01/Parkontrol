import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('TIPO_CELDA')
export class TipoCelda {
  @PrimaryGeneratedColumn({ name: 'ID_TIPO_CELDA' })
  id: number;

  @Column({ name: 'NOMBRE', length: 50, nullable: false })
  nombre: string;
}
