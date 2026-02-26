import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './entities/dto/crear-vehiculo.dto';
import { Vehiculo } from './entities/vehiculo.entity';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { TipoVehiculo } from 'src/shared/entities/tipo-vehiculo.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';

@Controller('vehicles')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  private validarPlaca(placa: string): string {
    const cleaned = placa?.trim().toUpperCase();

    if (!cleaned || !/^[A-Z0-9-]{5,10}$/.test(cleaned)) {
      throw new BadRequestException(
        'placa inválida: use entre 5 y 10 caracteres alfanuméricos',
      );
    }

    return cleaned;
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crear(@Body() createVehiculoDto: CreateVehiculoDto): Promise<Vehiculo> {
    return await this.vehiculosService.crear(createVehiculoDto);
  }

  @Get('placa/:placa')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorPlaca(@Param('placa') placa: string): Promise<Vehiculo> {
    const placaValida = this.validarPlaca(placa);
    const vehiculo = await this.vehiculosService.findByPlaca(placaValida);
    if (!vehiculo) {
      throw new NotFoundException(
        `No existe vehículo con placa: ${placaValida}`,
      );
    }
    return vehiculo;
  }

  @Get('tipos')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerTiposVehiculo(): Promise<TipoVehiculo[]> {
    return await this.vehiculosService.findAllTiposVehiculo();
  }

  @Get(':id/reservas')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerReservasPorVehiculo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Reserva[]> {
    return await this.vehiculosService.findReservasByVehiculo(id);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Vehiculo> {
    return await this.vehiculosService.findVehiculoById(id);
  }
}
