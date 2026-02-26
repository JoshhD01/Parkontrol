import { Usuario } from 'src/usuarios/entities/usuario.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('CLIENTE_FACTURA')
export class ClienteFactura {
  @PrimaryGeneratedColumn({ name: 'ID_CLIENTE_FACTURA' })
  id: number;

  @Column({ name: 'TIPO_DOCUMENTO', length: 10, nullable: false })
  tipoDocumento: string;

  @Column({ name: 'NUMERO_DOCUMENTO', length: 20, nullable: false })
  numeroDocumento: string;

  @Column({ name: 'CORREO', length: 50, nullable: false })
  correo: string;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'ID_USUARIO' })
  usuario?: Usuario;
}
