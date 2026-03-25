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
import { FacturacionService } from 'src/service/facturacion/facturacion.service';
import { CreateFacturaDto } from './dto/crear-factura-electronica.dto';
import { CreateClienteFacturaDto } from './dto/crear-cliente-factura.dto';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { Roles } from 'src/entities/shared';
import { RoleEnum } from 'src/entities/shared';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from 'src/entities/shared';
import { GetUser } from 'src/entities/shared';
import type { JwtUsuario } from '../auth/interfaces';

@Controller('invoicing')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get('facturas/client/mias')
  // UseGuards(JwtAuthGuard)
  async obtenerFacturasCliente(
    @GetUser() user: JwtUsuario,
  ): Promise<any[]> {
    if (user.nombreRol !== 'CLIENTE') {
      throw new UnauthorizedException(
        'Acceso exclusivo para clientes autenticados',
      );
    }

    return await this.facturacionService.findMisFacturas(user.id);
  }

  @Post('clientes')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async crearCliente(
    @Body() createClienteDto: CreateClienteFacturaDto,
  ): Promise<ClienteFactura> {
    return await this.facturacionService.crearCliente(createClienteDto);
  }

  @Post('facturas')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async crearFactura(
    @Body() createFacturaDto: CreateFacturaDto,
  ): Promise<any> {
    return await this.facturacionService.crearFactura(createFacturaDto);
  }
/*
  @Patch('facturas/:id/enviar')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async marcarEnviada(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FacturaElectronica> {
    return await this.facturacionService.marcarComoEnviada(id);
  }
    
  */

  @Get('facturas/pago/:idPago')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorPago(
    @Param('idPago', ParseIntPipe) idPago: number,
  ): Promise<any> {
    const factura = await this.facturacionService.findByPago(idPago);
    if (!factura) {
      throw new NotFoundException(
        `No existe factura para el pago con id: ${idPago}`,
      );
    }
    return factura;
  }

  @Get('clientes')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerClientes(): Promise<ClienteFactura[]> {
    return await this.facturacionService.obtenerClientes();
  }
}
