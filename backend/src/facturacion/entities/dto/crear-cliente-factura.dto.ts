import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateClienteFacturaDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 10)
  tipoDocumento: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  numeroDocumento: string;

  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idUsuario?: number;
}
