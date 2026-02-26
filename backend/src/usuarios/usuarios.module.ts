import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { SharedModule } from 'src/shared/shared.module';
import { UsuarioValidator } from './validators/usuario.validator';
import { EmpresasModule } from 'src/empresas/empresas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), SharedModule, EmpresasModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuarioValidator],
  exports: [UsuariosService, UsuarioValidator],
})
export class UsuariosModule {}
