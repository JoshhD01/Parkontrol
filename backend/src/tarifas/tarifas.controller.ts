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
import { TarifasService } from './tarifas.service';
import { CreateTarifaDto } from './entities/dto/crear-tarifa.dto';
import { UpdateTarifaDto } from './entities/dto/actualizar-tarifa.dto';
import { Tarifa } from './entities/tarifa.entity';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';

@Controller('rates')
export class TarifasController {
  constructor(private readonly tarifasService: TarifasService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crear(@Body() createTarifaDto: CreateTarifaDto): Promise<Tarifa> {
    return await this.tarifasService.crear(createTarifaDto);
  }

  @Get('parqueadero/:idParqueadero')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ): Promise<Tarifa[]> {
    return await this.tarifasService.findByParqueadero(idParqueadero);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateTarifaDto,
  ): Promise<Tarifa> {
    return await this.tarifasService.actualizar(id, updateData);
  }
}
