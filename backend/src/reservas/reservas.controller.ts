import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './entities/dto/crear-reserva.dto';
import { ReservarClienteDto } from './entities/dto/reservar-cliente.dto';
import { Reserva } from './entities/reserva.entity';
import { Vehiculo } from 'src/vehiculos/entities/vehiculo.entity';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';
import { GetUser } from 'src/shared/decorators';
import type { JwtUsuario } from 'src/auth/interfaces';

@Controller('reservations')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('client/mias')
  @UseGuards(JwtAuthGuard)
  async obtenerMisReservas(@GetUser() user: JwtUsuario): Promise<Reserva[]> {
    if (user.nombreRol !== 'CLIENTE') {
      throw new UnauthorizedException(
        'Acceso exclusivo para clientes autenticados',
      );
    }

    return await this.reservasService.findByClienteFacturaOrCorreo(
      user.id,
      user.correo,
    );
  }

  @Get('client/vehiculos')
  @UseGuards(JwtAuthGuard)
  async obtenerMisVehiculos(@GetUser() user: JwtUsuario): Promise<Vehiculo[]> {
    if (user.nombreRol !== 'CLIENTE') {
      throw new UnauthorizedException(
        'Acceso exclusivo para clientes autenticados',
      );
    }

    return await this.reservasService.findVehiculosByClienteFacturaOrCorreo(
      user.id,
      user.correo,
    );
  }

  @Post('client')
  @UseGuards(JwtAuthGuard)
  async crearComoCliente(
    @GetUser() user: JwtUsuario,
    @Body() reservarClienteDto: ReservarClienteDto,
  ): Promise<Reserva> {
    if (user.nombreRol !== 'CLIENTE') {
      throw new UnauthorizedException(
        'Acceso exclusivo para clientes autenticados',
      );
    }

    return await this.reservasService.crearParaCliente(user.id, reservarClienteDto);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crear(@Body() createReservaDto: CreateReservaDto): Promise<Reserva> {
    return await this.reservasService.crear(createReservaDto);
  }

  @Patch(':id/finalizar')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async finalizar(@Param('id', ParseIntPipe) id: number): Promise<Reserva> {
    return await this.reservasService.finalizarReserva(id);
  }

  @Get('activas')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerActivas(): Promise<Reserva[]> {
    return await this.reservasService.findActivas();
  }

  @Get('parqueadero/:idParqueadero')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ): Promise<Reserva[]> {
    return await this.reservasService.findByParqueadero(idParqueadero);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Reserva> {
    return await this.reservasService.findReservaById(id);
  }
}
