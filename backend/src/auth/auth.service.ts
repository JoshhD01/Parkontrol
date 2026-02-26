import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import {
  LoginResponseDto,
  LoginUsuarioDto,
  RegistrarClienteDto,
} from './entities/dto';
import { TipoAccesoLogin } from './entities/dto/login-usuario.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { RoleEnum } from 'src/shared/entities/rol.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteFactura } from 'src/facturacion/entities/cliente-factura.entity';
import { ClienteAuth } from './entities/cliente-auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
    @InjectRepository(ClienteFactura)
    private readonly clienteFacturaRepository: Repository<ClienteFactura>,
    @InjectRepository(ClienteAuth)
    private readonly clienteAuthRepository: Repository<ClienteAuth>,
  ) {}

  private async validarUsuario(
    correo: string,
    contrasena: string,
  ): Promise<Usuario | null> {
    const usuario = await this.usuariosService.findUsuarioByCorreo(correo);
    if (usuario && (await bcrypt.compare(contrasena, usuario?.contrasena))) {
      return usuario;
    }
    return null;
  }

  private async validarCliente(
    correo: string,
    contrasena: string,
  ): Promise<ClienteAuth | null> {
    const clienteAuth = await this.clienteAuthRepository.findOne({
      where: { correo, activo: true },
      relations: ['clienteFactura'],
    });

    if (
      clienteAuth &&
      (await bcrypt.compare(contrasena, clienteAuth.contrasenaHash))
    ) {
      return clienteAuth;
    }

    return null;
  }

  async registrarCliente(
    registrarClienteDto: RegistrarClienteDto,
  ): Promise<{ idClienteFactura: number; correo: string }> {
    const { tipoDocumento, numeroDocumento, correo, contrasena } =
      registrarClienteDto;

    let clienteFactura = await this.clienteFacturaRepository.findOne({
      where: { numeroDocumento },
    });

    if (clienteFactura && clienteFactura.correo.toLowerCase() !== correo) {
      throw new BadRequestException(
        'El documento ya está asociado a otro correo',
      );
    }

    if (!clienteFactura) {
      clienteFactura = this.clienteFacturaRepository.create({
        tipoDocumento,
        numeroDocumento,
        correo,
      });
      clienteFactura = await this.clienteFacturaRepository.save(clienteFactura);
    }

    const clienteAuthExistente = await this.clienteAuthRepository.findOne({
      where: [{ correo }, { clienteFactura: { id: clienteFactura.id } }],
      relations: ['clienteFactura'],
    });

    if (clienteAuthExistente) {
      throw new BadRequestException('El cliente ya tiene acceso registrado');
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const clienteAuth = this.clienteAuthRepository.create({
      clienteFactura,
      correo,
      contrasenaHash,
      activo: true,
    });

    await this.clienteAuthRepository.save(clienteAuth);

    return {
      idClienteFactura: clienteFactura.id,
      correo: clienteAuth.correo,
    };
  }

  async login(loginUsuarioDto: LoginUsuarioDto): Promise<LoginResponseDto> {
    const tipoAcceso = loginUsuarioDto.tipoAcceso ?? TipoAccesoLogin.CLIENTE;

    if (tipoAcceso === TipoAccesoLogin.CLIENTE) {
      const clienteValido = await this.validarCliente(
        loginUsuarioDto.correo,
        loginUsuarioDto.contrasena,
      );

      if (!clienteValido) {
        throw new UnauthorizedException('email o password invalidos');
      }

      const payload = {
        id: clienteValido.clienteFactura.id,
        correo: clienteValido.correo,
        nombreRol: TipoAccesoLogin.CLIENTE,
        idEmpresa: 0,
      };

      return { access_token: this.jwtService.sign(payload) };
    }

    const usuarioValido = await this.validarUsuario(
      loginUsuarioDto.correo,
      loginUsuarioDto.contrasena,
    );

    if (!usuarioValido) {
      throw new UnauthorizedException('email o password invalidos');
    }

    const rolUsuario = usuarioValido.rol?.nombre;

    if (tipoAcceso === TipoAccesoLogin.ADMIN && rolUsuario !== RoleEnum.ADMIN) {
      throw new UnauthorizedException(
        'Acceso denegado: este ingreso es exclusivo para administradores',
      );
    }

    if (
      tipoAcceso === TipoAccesoLogin.OPERADOR &&
      rolUsuario !== RoleEnum.OPERADOR
    ) {
      throw new UnauthorizedException(
        'Acceso denegado: este ingreso es exclusivo para operadores',
      );
    }

    const payload = {
      id: usuarioValido.id,
      correo: usuarioValido.correo,
      nombreRol: usuarioValido.rol.nombre,
      idEmpresa: usuarioValido.empresa.id,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
