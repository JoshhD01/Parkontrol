import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CambiarContrasenaDto {
  @IsNotEmpty()
  @IsString()
  contrasenaActual: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  nuevaContrasena: string;
}
