import { Empresa } from 'src/empresas/entities/empresa.entity';
import { Rol } from 'src/shared/entities/rol.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('USUARIO')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'ID_USUARIO' })
  id: number;

  @Column({ name: 'NOMBRE', length: 100, nullable: false })
  nombre: string;

  @Column({ name: 'CORREO', length: 100, unique: true, nullable: false })
  correo: string;

  @Column({ name: 'CONTRASENA', length: 255, nullable: false })
  contrasena: string;

  @ManyToOne(() => Rol, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'ID_ROL' })
  rol: Rol;

  @ManyToOne(() => Empresa, (empresa) => empresa.usuarios, {
    nullable: false,
  })
  @JoinColumn({ name: 'ID_EMPRESA' })
  empresa: Empresa;
}
