import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum TipoAccesoLogin {
  CLIENTE = 'CLIENTE',
  ADMIN = 'ADMIN',
  OPERADOR = 'OPERADOR',
}

export class LoginUsuarioDto {
  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsOptional()
  @IsEnum(TipoAccesoLogin)
  tipoAcceso?: TipoAccesoLogin;
}
