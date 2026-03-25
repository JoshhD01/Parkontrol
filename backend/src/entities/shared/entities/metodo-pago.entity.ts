import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('METODO_PAGO')
export class MetodoPago {
  @PrimaryGeneratedColumn({ name: 'ID_METODO_PAGO' })
  id: number;

  @Column({ name: 'NOMBRE', length: 50, nullable: false })
  nombre: string;
}
