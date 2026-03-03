import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

export class CreateFacturaElectronicaDto {
  @IsNotEmpty()
  @IsNumber()
  idPago: number;

  @IsOptional()
  @IsNumber()
  idClienteFactura?: number;

  @IsOptional()
  @IsBoolean()
  emitirElectronica?: boolean;

  @ValidateIf((dto: CreateFacturaElectronicaDto) => dto.emitirElectronica === true)
  @IsNotEmpty()
  @IsString()
  cufe?: string;

  @ValidateIf((dto: CreateFacturaElectronicaDto) => dto.emitirElectronica === true)
  @IsNotEmpty()
  @IsEmail()
  correoElectronico?: string;

  @IsOptional()
  @IsString()
  urlPdf?: string;
}
