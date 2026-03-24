import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CeldasController } from 'src/controller/celdas/celdas.controller';
import { CeldasService } from 'src/service/celdas/celdas.service';
import { Celda } from './entities/celda.entity';
import { SharedModule } from '../shared/shared.module';
import { ParqueaderosModule } from '../parqueaderos/parqueaderos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Celda]),
    SharedModule,
    ParqueaderosModule,
  ],
  controllers: [CeldasController],
  providers: [CeldasService],
  exports: [CeldasService],
})
export class CeldasModule {}
