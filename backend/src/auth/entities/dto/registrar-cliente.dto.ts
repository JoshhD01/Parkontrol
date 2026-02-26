import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum TipoDocumentoCliente {
  CC = 'CC',
  CE = 'CE',
  TI = 'TI',
  PAS = 'PAS',
  NIT = 'NIT',
}

export class RegistrarClienteDto {
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsNotEmpty()
  @IsEnum(TipoDocumentoCliente)
  tipoDocumento: TipoDocumentoCliente;

  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[A-Z0-9-]+$/, {
    message:
      'numeroDocumento inválido: use solo letras, números o guion (3 a 30 caracteres)',
  })
  numeroDocumento: string;

  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  correo: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'La contraseña debe contener al menos una letra y un número',
  })
  contrasena: string;
}
