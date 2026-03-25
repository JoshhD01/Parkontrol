import { Module } from '@nestjs/common';
import { UsuariosController } from 'src/controller/usuarios/usuarios.controller';
import { UsuariosService } from 'src/service/usuarios/usuarios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { SharedModule } from '../shared/shared.module';
import { UsuarioValidator } from 'src/controller/usuarios/validators/usuario.validator';
import { EmpresasModule } from '../empresas/empresas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), SharedModule, EmpresasModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuarioValidator],
  exports: [UsuariosService, UsuarioValidator],
})
export class UsuariosModule {}
