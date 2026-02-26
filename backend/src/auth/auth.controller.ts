import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginResponseDto,
  LoginUsuarioDto,
  RegistrarClienteDto,
} from './entities/dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerAdminDisabled(): never {
    throw new ForbiddenException(
      'Registro de administradores deshabilitado por API. Esta operación se realiza internamente.',
    );
  }

  @Post('register-client')
  async registerBillingClient(
    @Body() registrarClienteDto: RegistrarClienteDto,
  ): Promise<{ idClienteFactura: number; correo: string }> {
    return await this.authService.registrarCliente(registrarClienteDto);
  }

  @Post('login')
  async login(
    @Body() loginUsuarioDto: LoginUsuarioDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(loginUsuarioDto);
  }
}
