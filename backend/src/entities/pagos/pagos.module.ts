import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosController } from 'src/controller/pagos/pagos.controller';
import { PagosService } from 'src/service/pagos/pagos.service';
import { Pago } from './entities/pago.entity';
import { SharedModule } from '../shared/shared.module';
import { ReservasModule } from '../reservas/reservas.module';
import { TarifasModule } from '../tarifas/tarifas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago]),
    SharedModule,
    ReservasModule,
    TarifasModule,
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
