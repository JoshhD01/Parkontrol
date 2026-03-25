import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarifasController } from 'src/controller/tarifas/tarifas.controller';
import { TarifasService } from 'src/service/tarifas/tarifas.service';
import { Tarifa } from './entities/tarifa.entity';
import { SharedModule } from '../shared/shared.module';
import { ParqueaderosModule } from '../parqueaderos/parqueaderos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tarifa]),
    SharedModule,
    ParqueaderosModule,
  ],
  controllers: [TarifasController],
  providers: [TarifasService],
  exports: [TarifasService],
})
export class TarifasModule {}
