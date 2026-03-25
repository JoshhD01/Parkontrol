import { Module } from '@nestjs/common';
import { ParqueaderosController } from 'src/controller/parqueaderos/parqueaderos.controller';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';
import { Parqueadero } from './entities/parqueadero.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresasModule } from '../empresas/empresas.module';
import { SharedModule } from '../shared/shared.module';
import { Celda } from '../celdas/entities/celda.entity';
import { TipoCelda } from '../shared/entities/tipo-celda.entity';
import { Sensor } from '../shared/entities/sensor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parqueadero, Celda, TipoCelda, Sensor]),
    EmpresasModule,
    SharedModule,
  ],
  controllers: [ParqueaderosController],
  providers: [ParqueaderosService],
  exports: [ParqueaderosService],
})
export class ParqueaderosModule {}
