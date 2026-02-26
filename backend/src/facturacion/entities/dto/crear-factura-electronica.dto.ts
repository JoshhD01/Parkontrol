import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateFacturaElectronicaDto {
  @IsNotEmpty()
  @IsNumber()
  idPago: number;

  @IsOptional()
  @IsNumber()
  idClienteFactura?: number;

  @IsNotEmpty()
  @IsString()
  cufe: string;

  @IsOptional()
  @IsString()
  urlPdf?: string;
}
