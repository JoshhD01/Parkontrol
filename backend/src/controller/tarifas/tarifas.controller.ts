import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TarifasService } from 'src/service/tarifas/tarifas.service';
import { CreateTarifaDto } from './dto/crear-tarifa.dto';
import { UpdateTarifaDto } from './dto/actualizar-tarifa.dto';
import { Tarifa } from 'src/entities/tarifas/entities/tarifa.entity';
import { Roles,RoleEnum } from 'src/entities/shared';

@Controller('rates')
export class TarifasController {
  constructor(private readonly tarifasService: TarifasService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async crear(@Body() createTarifaDto: CreateTarifaDto): Promise<Tarifa> {
    return await this.tarifasService.crear(createTarifaDto);
  }

  @Get('parqueadero/:idParqueadero')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ): Promise<Tarifa[]> {
    return await this.tarifasService.findByParqueadero(idParqueadero);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateTarifaDto,
  ): Promise<Tarifa> {
    return await this.tarifasService.actualizar(id, updateData);
  }
}
