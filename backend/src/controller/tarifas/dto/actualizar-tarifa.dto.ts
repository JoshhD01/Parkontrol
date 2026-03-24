import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateTarifaDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioFraccionHora?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioHoraAdicional?: number;
}
