import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { MetodoPago } from 'src/shared/entities/metodo-pago.entity';

@Entity('PAGO')
export class Pago {
  @PrimaryGeneratedColumn({ name: 'ID_PAGO' })
  id: number;

  @Column({
    name: 'MONTO',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  monto: number;

  @Column({ name: 'FECHA_PAGO', type: 'timestamp', nullable: false })
  fechaPago: Date;

  @ManyToOne(() => Reserva, { nullable: false })
  @JoinColumn({ name: 'ID_RESERVA' })
  reserva: Reserva;

  @ManyToOne(() => MetodoPago, { nullable: false })
  @JoinColumn({ name: 'ID_METODO_PAGO' })
  metodoPago: MetodoPago;
}
