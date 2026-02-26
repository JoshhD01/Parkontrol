import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresaResponseDto } from './entities/dto/empresa-response.dto';
import { Roles } from 'src/shared/decorators';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { RolesGuard } from 'src/shared/guards';

@Controller('companies')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerTodas(): Promise<EmpresaResponseDto[]> {
    return this.empresasService.obtenerTodas();
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.OPERADOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerDetalle(
    @Param('id', ParseIntPipe) idEmpresa: number,
  ): Promise<EmpresaResponseDto> {
    return this.empresasService.obtenerDetalle(idEmpresa);
  }
}
