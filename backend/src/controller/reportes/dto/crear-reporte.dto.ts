import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReporteDto {
  @IsNotEmpty()
  @IsNumber()
  idParqueadero: number;

  @IsNotEmpty()
  @IsNumber()
  idPeriodo: number;

  @IsOptional()
  @IsString()
  urlArchivo?: string;
}
