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
import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './entities/dto/crear-reporte.dto';
import { Reporte } from './entities/reporte.entity';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';

@Controller('reports')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crear(@Body() createReporteDto: CreateReporteDto): Promise<Reporte> {
    return await this.reportesService.crear(createReporteDto);
  }

  @Get('parqueadero/:idParqueadero')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ): Promise<Reporte[]> {
    return await this.reportesService.findByParqueadero(idParqueadero);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Reporte> {
    return await this.reportesService.findReporteById(id);
  }

  @Patch(':id/url')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async actualizarUrl(
    @Param('id', ParseIntPipe) id: number,
    @Body('urlArchivo') urlArchivo: string,
  ): Promise<Reporte> {
    return await this.reportesService.actualizarUrl(id, urlArchivo);
  }
}
