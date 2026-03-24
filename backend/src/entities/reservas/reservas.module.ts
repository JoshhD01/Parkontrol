import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasController } from 'src/controller/reservas/reservas.controller';
import { ReservasService } from 'src/service/reservas/reservas.service';
import { Reserva } from './entities/reserva.entity';
import { VehiculosModule } from '../vehiculos/vehiculos.module';
import { CeldasModule } from '../celdas/celdas.module';
import { ClienteFactura } from '../facturacion/entities/cliente-factura.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, ClienteFactura]),
    VehiculosModule,
    CeldasModule,
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
