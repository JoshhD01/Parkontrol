import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFacturaDto {
  @IsNotEmpty()
  @IsNumber()
  idPago: number;

  @IsOptional()
  @IsNumber()
  idClienteFactura?: number;
}
