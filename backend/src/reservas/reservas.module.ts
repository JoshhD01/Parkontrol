import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { Reserva } from './entities/reserva.entity';
import { VehiculosModule } from 'src/vehiculos/vehiculos.module';
import { CeldasModule } from 'src/celdas/celdas.module';
import { ClienteFactura } from 'src/facturacion/entities/cliente-factura.entity';

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
