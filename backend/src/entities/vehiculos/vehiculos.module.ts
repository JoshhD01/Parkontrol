import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculosController } from 'src/controller/vehiculos/vehiculos.controller';
import { VehiculosService } from 'src/service/vehiculos/vehiculos.service';
import { Vehiculo } from './entities/vehiculo.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Reserva]), SharedModule],
  controllers: [VehiculosController],
  providers: [VehiculosService],
  exports: [VehiculosService],
})
export class VehiculosModule {}
