import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReportesService } from 'src/service/reportes/reportes.service';
import { CreateReporteDto } from './dto/crear-reporte.dto';
import { Reporte } from 'src/entities/reportes/entities/reporte.entity';
import { Roles } from 'src/entities/shared';
import { RoleEnum } from 'src/entities/shared';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from 'src/entities/shared';

@Controller('reports')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async crear(@Body() createReporteDto: CreateReporteDto): Promise<Reporte> {
    return await this.reportesService.crear(createReporteDto);
  }

  @Get('parqueadero/:idParqueadero')
  @Roles(RoleEnum.ADMIN)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ): Promise<Reporte[]> {
    return await this.reportesService.findByParqueadero(idParqueadero);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Reporte> {
    return await this.reportesService.findReporteById(id);
  }

  @Patch(':id/url')
  @Roles(RoleEnum.ADMIN)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async actualizarUrl(
    @Param('id', ParseIntPipe) id: number,
    @Body('urlArchivo') urlArchivo: string,
  ): Promise<Reporte> {
    return await this.reportesService.actualizarUrl(id, urlArchivo);
  }
}
