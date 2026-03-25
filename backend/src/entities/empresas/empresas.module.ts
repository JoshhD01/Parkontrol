import { Module } from '@nestjs/common';
import { EmpresasController } from 'src/controller/empresas/empresas.controller';
import { EmpresasService } from 'src/service/empresas/empresas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa]), SharedModule],
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
