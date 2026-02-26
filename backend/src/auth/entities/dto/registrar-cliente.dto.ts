import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegistrarClienteDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  tipoDocumento: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  numeroDocumento: string;

  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  contrasena: string;
}
