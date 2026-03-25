import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EmpresasService } from 'src/service/empresas/empresas.service';
import { EmpresaResponseDto } from './dto/empresa-response.dto';
import { Roles, RoleEnum } from 'src/entities/shared';

@Controller('companies')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  @Roles(RoleEnum.ADMIN)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerTodas(): Promise<EmpresaResponseDto[]> {
    return this.empresasService.obtenerTodas();
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  //  UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerDetalle(
    @Param('id', ParseIntPipe) idEmpresa: number,
  ): Promise<EmpresaResponseDto> {
    return this.empresasService.obtenerDetalle(idEmpresa);
  }
}
