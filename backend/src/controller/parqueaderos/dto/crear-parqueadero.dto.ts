import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateParqueaderoDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsNotEmpty()
  @IsNumber()
  capacidadTotal: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  ubicacion: string;

  @IsNotEmpty()
  @IsNumber()
  idEmpresa: number;
}
