import { Empresa } from 'src/empresas/entities/empresa.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('PARQUEADERO')
export class Parqueadero {
  @PrimaryGeneratedColumn({ name: 'ID_PARQUEADERO' })
  id: number;

  @Column({ name: 'NOMBRE', length: 100, nullable: false })
  nombre: string;

  @Column({ name: 'CAPACIDAD_TOTAL', type: 'int', nullable: false })
  capacidadTotal: number;

  @Column({ name: 'UBICACION', length: 255, nullable: false })
  ubicacion: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.parqueaderos, {
    nullable: false,
  })
  @JoinColumn({ name: 'ID_EMPRESA' })
  empresa: Empresa;
}
