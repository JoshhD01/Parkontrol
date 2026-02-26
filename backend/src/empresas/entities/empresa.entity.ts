import { Parqueadero } from 'src/parqueaderos/entities/parqueadero.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'EMPRESA' })
export class Empresa {
  @PrimaryGeneratedColumn({ name: 'ID_EMPRESA' })
  id: number;

  @Column({ name: 'NOMBRE', length: 20, nullable: false })
  nombre: string;

  @OneToMany(() => Usuario, (usuario) => usuario.empresa, {
    cascade: ['insert', 'update'],
  })
  usuarios: Usuario[];

  @OneToMany(() => Parqueadero, (parqueadero) => parqueadero.empresa, {
    cascade: ['insert', 'update'],
  })
  parqueaderos: Parqueadero[];
}
