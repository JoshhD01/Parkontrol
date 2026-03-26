import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CeldasService } from 'src/service/celdas/celdas.service';
import { CreateCeldaDto } from './dto/crear-celda.dto';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { Roles, RoleEnum } from 'src/entities/shared';

@Controller('cells')
export class CeldasController {
  constructor(private readonly celdasService: CeldasService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async crear(@Body() createCeldaDto: CreateCeldaDto): Promise<Celda> {
    return await this.celdasService.crear(createCeldaDto);
  }

  @Get('parqueadero/:idParqueadero')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ): Promise<Celda[]> {
    return await this.celdasService.findByParqueadero(idParqueadero);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Celda> {
    return await this.celdasService.findCeldaById(id);
  }

  @Patch(':id/estado')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
  ): Promise<Celda> {
    return await this.celdasService.actualizarEstado(id, estado);
  }
}
