import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from 'src/controller/reportes/reportes.controller';
import { ReportesService } from 'src/service/reportes/reportes.service';
import { Reporte } from './entities/reporte.entity';
import { SharedModule } from '../shared/shared.module';
import { ParqueaderosModule } from '../parqueaderos/parqueaderos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reporte]),
    SharedModule,
    ParqueaderosModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
