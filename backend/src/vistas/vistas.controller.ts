import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VistasService } from './vistas.service';
import { ProcesarPagoDto } from './dto/procesar-pago.dto';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';

@Controller('views')
export class VistasController {
  constructor(private readonly vistasService: VistasService) {}

  private parseOptionalEmpresaId(idEmpresa?: string): number | null {
    if (
      idEmpresa === undefined ||
      idEmpresa === null ||
      idEmpresa.trim() === ''
    ) {
      return null;
    }

    const parsed = Number(idEmpresa);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('idEmpresa debe ser un entero mayor a 0');
    }

    return parsed;
  }

  private validatePlaca(placa: string): string {
    const cleaned = placa?.trim().toUpperCase();
    if (!cleaned || !/^[A-Z0-9-]{5,10}$/.test(cleaned)) {
      throw new BadRequestException(
        'placa inválida: use entre 5 y 10 caracteres alfanuméricos',
      );
    }

    return cleaned;
  }

  private validateNumeroDocumento(numeroDocumento: string): string {
    const cleaned = numeroDocumento?.trim();
    if (!cleaned || cleaned.length < 3 || cleaned.length > 30) {
      throw new BadRequestException(
        'numeroDocumento inválido: use entre 3 y 30 caracteres',
      );
    }

    return cleaned;
  }

  @Get('ocupacion')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOcupacionParqueaderos(@Query('idEmpresa') idEmpresa?: string) {
    const idEmpresaNum = this.parseOptionalEmpresaId(idEmpresa);
    return await this.vistasService.getOcupacionByEmpresa(idEmpresaNum);
  }

  @Get('ocupacion/:idParqueadero')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOcupacionByParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ) {
    const ocupacion =
      await this.vistasService.getOcupacionByParqueadero(idParqueadero);

    if (!ocupacion) {
      throw new NotFoundException({
        message: `No occupation data found for parking lot ${idParqueadero}`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return ocupacion;
  }

  @Get('historial-reservas')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getHistorialReservas(@Query('idEmpresa') idEmpresa?: string) {
    const idEmpresaNum = this.parseOptionalEmpresaId(idEmpresa);
    return await this.vistasService.getHistorialByEmpresa(idEmpresaNum);
  }

  @Get('historial-reservas/parqueadero/:idParqueadero/placa/:placa')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getHistorialByPlacaAndParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
    @Param('placa') placa: string,
  ) {
    const placaValida = this.validatePlaca(placa);
    const ocupacion =
      await this.vistasService.getOcupacionByParqueadero(idParqueadero);

    if (!ocupacion) {
      throw new NotFoundException({
        message: `Parking lot ${idParqueadero} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return await this.vistasService.getHistorialByPlacaAndParqueadero(
      placaValida,
      idParqueadero,
    );
  }

  @Get('facturacion')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getFacturacionCompleta(@Query('idEmpresa') idEmpresa?: string) {
    const idEmpresaNum = this.parseOptionalEmpresaId(idEmpresa);
    return await this.vistasService.getFacturacionByEmpresa(idEmpresaNum);
  }

  @Get('facturacion/documento/:numeroDocumento')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getFacturacionByDocumento(
    @Param('numeroDocumento') numeroDocumento: string,
    @Query('idEmpresa') idEmpresa?: string,
  ) {
    const idEmpresaNum = this.parseOptionalEmpresaId(idEmpresa);
    const documentoValido = this.validateNumeroDocumento(numeroDocumento);
    return await this.vistasService.getFacturacionByDocumento(
      documentoValido,
      idEmpresaNum,
    );
  }

  @Get('ingresos')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getIngresosMensuales(@Query('idEmpresa') idEmpresa?: string) {
    const idEmpresaNum = this.parseOptionalEmpresaId(idEmpresa);
    return await this.vistasService.getIngresosByEmpresa(idEmpresaNum);
  }

  @Get('ingresos/parqueadero/:idParqueadero')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getIngresosByParqueadero(
    @Param('idParqueadero', ParseIntPipe) idParqueadero: number,
  ) {
    const ocupacion =
      await this.vistasService.getOcupacionByParqueadero(idParqueadero);

    if (!ocupacion) {
      throw new NotFoundException({
        message: `Parking lot ${idParqueadero} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return await this.vistasService.getIngresosByParqueadero(idParqueadero);
  }

  @Post('procesar-pago')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async procesarPago(@Body() procesarPagoDto: ProcesarPagoDto) {
    return await this.vistasService.procesarPago(
      procesarPagoDto.idReserva,
      procesarPagoDto.idMetodoPago,
    );
  }

  @Get('buscar-vehiculo/:placa')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async buscarVehiculoPorPlaca(@Param('placa') placa: string) {
    const placaValida = this.validatePlaca(placa);
    return await this.vistasService.buscarVehiculoPorPlaca(placaValida);
  }
}
