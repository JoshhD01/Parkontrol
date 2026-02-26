import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { CreateFacturaElectronicaDto } from './entities/dto/crear-factura-electronica.dto';
import { CreateClienteFacturaDto } from './entities/dto/crear-cliente-factura.dto';
import { FacturaElectronica } from './entities/factura-electronica.entity';
import { ClienteFactura } from './entities/cliente-factura.entity';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';
import { GetUser } from 'src/shared/decorators';
import type { JwtUsuario } from 'src/auth/interfaces';

@Controller('invoicing')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get('facturas/client/mias')
  @UseGuards(JwtAuthGuard)
  async obtenerFacturasCliente(
    @GetUser() user: JwtUsuario,
  ): Promise<FacturaElectronica[]> {
    if (user.nombreRol !== 'CLIENTE') {
      throw new UnauthorizedException(
        'Acceso exclusivo para clientes autenticados',
      );
    }

    return await this.facturacionService.findByClienteFacturaOrCorreo(
      user.id,
      user.correo,
    );
  }

  @Post('clientes')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crearCliente(
    @Body() createClienteDto: CreateClienteFacturaDto,
  ): Promise<ClienteFactura> {
    return await this.facturacionService.crearCliente(createClienteDto);
  }

  @Post('facturas')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async crearFactura(
    @Body() createFacturaDto: CreateFacturaElectronicaDto,
  ): Promise<FacturaElectronica> {
    return await this.facturacionService.crearFactura(createFacturaDto);
  }

  @Patch('facturas/:id/enviar')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async marcarEnviada(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FacturaElectronica> {
    return await this.facturacionService.marcarComoEnviada(id);
  }

  @Get('facturas/pago/:idPago')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPorPago(
    @Param('idPago', ParseIntPipe) idPago: number,
  ): Promise<FacturaElectronica> {
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerClientes(): Promise<ClienteFactura[]> {
    return await this.facturacionService.obtenerClientes();
  }
}
