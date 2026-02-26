import { Module } from '@nestjs/common';
import { ParqueaderosController } from './parqueaderos.controller';
import { ParqueaderosService } from './parqueaderos.service';
import { Parqueadero } from './entities/parqueadero.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresasModule } from 'src/empresas/empresas.module';
import { SharedModule } from 'src/shared/shared.module';
import { Celda } from 'src/celdas/entities/celda.entity';
import { TipoCelda } from 'src/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/shared/entities/sensor.entity';

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
