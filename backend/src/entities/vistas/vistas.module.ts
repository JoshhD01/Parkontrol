import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VistasController } from 'src/controller/vistas/vistas.controller';
import { VistasService } from 'src/service/vistas/vistas.service';
import { OcupacionParqueaderoView } from './entities/ocupacion-parqueadero.view';
import { HistorialReservasView } from './entities/historial-reservas.view';
import { FacturacionCompletaView } from './entities/facturacion-completa.view';
import { IngresosPorParqueaderoMensualView } from './entities/ingresos-parqueadero-mensual.view';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OcupacionParqueaderoView,
      HistorialReservasView,
      FacturacionCompletaView,
      IngresosPorParqueaderoMensualView,
    ]),
    SharedModule,
  ],
  controllers: [VistasController],
  providers: [VistasService],
  exports: [VistasService],
})
export class VistasModule {}
