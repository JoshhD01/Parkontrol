import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './entities/dto/crear-usuario.dto';
import { CambiarContrasenaDto } from './entities/dto/cambiar-contrasena.dto';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { UsuarioResponseDto } from './entities/dto/usuario-response.dto';
import { Roles } from 'src/shared/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';
import { GetUser } from 'src/shared/decorators';
import type { JwtUsuario } from 'src/auth/interfaces';

@Controller('users')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crear(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    // Convertir el rol del DTO a RoleEnum
    const nombreRol = createUsuarioDto.rol as RoleEnum;
    return await this.usuariosService.crear(createUsuarioDto, nombreRol);
  }

  @Get('empresa/:idEmpresa')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerUsuariosEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ): Promise<UsuarioResponseDto[]> {
    return await this.usuariosService.findByEmpresa(idEmpresa);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.usuariosService.findUsuarioById(id);
    return new UsuarioResponseDto(usuario);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ mensaje: string }> {
    await this.usuariosService.eliminar(id);
    return { mensaje: 'Usuario Operador eliminado correctamente' };
  }

  @Patch('cambiar-contrasena')
  @UseGuards(JwtAuthGuard)
  async cambiarContrasena(
    @GetUser() user: JwtUsuario,
    @Body() cambiarContrasenaDto: CambiarContrasenaDto,
  ): Promise<{ mensaje: string }> {
    return await this.usuariosService.cambiarContrasena(
      user.id,
      cambiarContrasenaDto,
    );
  }
}
