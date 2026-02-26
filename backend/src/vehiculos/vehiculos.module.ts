import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { Vehiculo } from './entities/vehiculo.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Reserva]), SharedModule],
  controllers: [VehiculosController],
  providers: [VehiculosService],
  exports: [VehiculosService],
})
export class VehiculosModule {}
