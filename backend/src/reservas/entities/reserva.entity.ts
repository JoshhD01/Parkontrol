import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehiculo } from 'src/vehiculos/entities/vehiculo.entity';
import { Celda } from 'src/celdas/entities/celda.entity';
import { ClienteFactura } from 'src/facturacion/entities/cliente-factura.entity';

@Entity('RESERVA')
export class Reserva {
  @PrimaryGeneratedColumn({ name: 'ID_RESERVA' })
  id: number;

  @Column({ name: 'FECHA_ENTRADA', type: 'timestamp', nullable: false })
  fechaEntrada: Date;

  @Column({ name: 'FECHA_SALIDA', type: 'timestamp', nullable: true })
  fechaSalida: Date;

  @Column({ name: 'ESTADO', length: 20, nullable: false })
  estado: string;

  @ManyToOne(() => Vehiculo, { nullable: false })
  @JoinColumn({ name: 'ID_VEHICULO' })
  vehiculo: Vehiculo;

  @ManyToOne(() => Celda, { nullable: false })
  @JoinColumn({ name: 'ID_CELDA' })
  celda: Celda;

  @ManyToOne(() => ClienteFactura, { nullable: true })
  @JoinColumn({ name: 'ID_CLIENTE_FACTURA' })
  clienteFactura?: ClienteFactura;
}
