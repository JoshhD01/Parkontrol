import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ParqueaderosService } from './parqueaderos.service';
import { CreateParqueaderoDto } from './entities/dto/crear-parqueadero.dto';
import { ParqueaderoResponseDto } from './entities/dto/parqueadero-response.dto';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';
import { GetUser } from 'src/shared/decorators';
import type { JwtUsuario } from 'src/auth/interfaces';

@Controller('parking-lots')
export class ParqueaderosController {
  constructor(private readonly parqueaderosService: ParqueaderosService) {}

  @Get('client/disponibles')
  @UseGuards(JwtAuthGuard)
  async obtenerDisponiblesParaCliente(
    @GetUser() user: JwtUsuario,
  ) {
    if (user.nombreRol !== 'CLIENTE') {
      throw new UnauthorizedException(
        'Acceso exclusivo para clientes autenticados',
      );
    }

    return this.parqueaderosService.findAllConDisponibilidad();
  }

  @Post()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crear(
    @Body() createParqueaderoDto: CreateParqueaderoDto,
  ): Promise<ParqueaderoResponseDto> {
    return this.parqueaderosService.crear(createParqueaderoDto);
  }

  @Get('empresa/:idEmpresa')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ): Promise<ParqueaderoResponseDto[]> {
    return this.parqueaderosService.findByEmpresa(idEmpresa);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerDetalle(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ParqueaderoResponseDto> {
    return this.parqueaderosService.obtenerDetalle(id);
  }
}
