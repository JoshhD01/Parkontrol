import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturacionController } from 'src/controller/facturacion/facturacion.controller';
import { FacturacionService } from 'src/service/facturacion/facturacion.service';
import { FacturaElectronica } from './entities/factura-electronica.entity';
import { ClienteFactura } from './entities/cliente-factura.entity';
import { PagosModule } from '../pagos/pagos.module';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacturaElectronica, ClienteFactura, Usuario]),
    PagosModule,
    SharedModule,
  ],
  controllers: [FacturacionController],
  providers: [FacturacionService],
  exports: [FacturacionService],
})
export class FacturacionModule {}
