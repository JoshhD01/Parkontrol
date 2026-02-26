import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pago } from 'src/pagos/entities/pago.entity';
import { ClienteFactura } from './cliente-factura.entity';

@Entity('FACTURA_ELECTRONICA')
export class FacturaElectronica {
  @PrimaryGeneratedColumn({ name: 'ID_FACTURA_ELECTRONICA' })
  id: number;

  @Column({ name: 'CUFE', length: 50, nullable: false })
  cufe: string;

  @Column({ name: 'URL_PDF', length: 200, nullable: true })
  urlPdf: string;

  @Column({ name: 'ENVIADA', type: 'char', length: 1, nullable: true })
  enviada: string;

  @Column({ name: 'FECHA_CREACION', type: 'timestamp', nullable: false })
  fechaCreacion: Date;

  @ManyToOne(() => Pago, { nullable: false })
  @JoinColumn({ name: 'ID_PAGO' })
  pago: Pago;

  @ManyToOne(() => ClienteFactura, { nullable: false })
  @JoinColumn({ name: 'ID_CLIENTE_FACTURA' })
  clienteFactura: ClienteFactura;
}
