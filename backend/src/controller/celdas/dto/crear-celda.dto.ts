import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCeldaDto {
  @IsNotEmpty()
  @IsNumber()
  idParqueadero: number;

  @IsNotEmpty()
  @IsNumber()
  idTipoCelda: number;

  @IsNotEmpty()
  @IsNumber()
  idSensor: number;

  @IsNotEmpty()
  @IsString()
  estado: string;
}
