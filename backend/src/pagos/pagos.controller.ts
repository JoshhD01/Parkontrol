import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
<<<<<<< Updated upstream:backend/src/pagos/pagos.controller.ts
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './entities/dto/crear-pago.dto';
import { Pago } from './entities/pago.entity';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';
import { GetUser } from 'src/shared/decorators';
import type { JwtUsuario } from 'src/auth/interfaces';
=======
import { PagosService } from 'src/service/pagos/pagos.service';
import { CreatePagoDto } from './dto/crear-pago.dto';
import { Pago } from 'src/entities/pagos/entities/pago.entity';
import { Roles, GetUser, RoleEnum, RolesGuard } from 'src/entities/shared';
import type { JwtUsuario } from '../auth/interfaces';
import { JwtAuthGuard } from '../auth/guards';
>>>>>>> Stashed changes:backend/src/controller/pagos/pagos.controller.ts

@Controller('payments')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crear(@Body() createPagoDto: CreatePagoDto): Promise<Pago> {
    return await this.pagosService.crear(createPagoDto);
  }

  @Get('parqueadero/:idParqueadero')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ): Promise<Pago[]> {
    return await this.pagosService.findByParqueadero(idParqueadero);
  }

  @Get('client/mis-pagos')
  @UseGuards(JwtAuthGuard)
  async obtenerMisPagos(@GetUser() user: JwtUsuario): Promise<Pago[]> {
    if (user.nombreRol !== 'CLIENTE') {
      throw new UnauthorizedException(
        'Acceso exclusivo para clientes autenticados',
      );
    }

    return await this.pagosService.findByCliente(user.id, user.correo);
  }

  @Get('reserva/:idReserva')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorReserva(
    @Param('idReserva', ParseIntPipe) idReserva: number,
  ): Promise<Pago> {
    const pago = await this.pagosService.findByReserva(idReserva);
    if (!pago) {
      throw new NotFoundException(
        `No existe pago para la reserva con id: ${idReserva}`,
      );
    }
    return pago;
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<Pago> {
    return await this.pagosService.findPagoById(id);
  }
}
