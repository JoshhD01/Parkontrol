import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/shared/entities/rol.entity';

export class CreateUsuarioDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  nombre: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([RoleEnum.ADMIN, RoleEnum.OPERADOR], {
    message: `rol debe ser uno de: ${RoleEnum.ADMIN}, ${RoleEnum.OPERADOR}`,
  })
  rol: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  idEmpresa: number;
}
