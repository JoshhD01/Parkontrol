import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateReservaDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNumber()
  idVehiculo: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNumber()
  idCelda: number;

  @IsNotEmpty()
  @IsString()
  estado: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNumber()
  idClienteFactura?: number;

  @IsNotEmpty()
  @IsISO8601()
  horaInicio: string;

  @IsNotEmpty()
  @IsISO8601()
  horaFin: string;
}
