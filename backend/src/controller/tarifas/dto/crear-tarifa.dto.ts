import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTarifaDto {
  @IsNotEmpty()
  @IsNumber()
  idParqueadero: number;

  @IsNotEmpty()
  @IsNumber()
  idTipoVehiculo: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precioFraccionHora: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioHoraAdicional?: number;
}
