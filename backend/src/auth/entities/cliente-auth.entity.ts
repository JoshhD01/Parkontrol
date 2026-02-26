import { ClienteFactura } from 'src/facturacion/entities/cliente-factura.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('CLIENTE_AUTH')
export class ClienteAuth {
  @PrimaryGeneratedColumn({ name: 'ID_CLIENTE_AUTH' })
  id: number;

  @OneToOne(() => ClienteFactura, { nullable: false })
  @JoinColumn({ name: 'ID_CLIENTE_FACTURA' })
  clienteFactura: ClienteFactura;

  @Column({ name: 'CORREO', length: 100, unique: true, nullable: false })
  correo: string;

  @Column({ name: 'CONTRASENA_HASH', length: 255, nullable: false })
  contrasenaHash: string;

  @Column({ name: 'ACTIVO', type: 'boolean', default: true })
  activo: boolean;
}
