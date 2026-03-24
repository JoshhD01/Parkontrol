import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

const TIPOS_DOCUMENTO_VALIDOS = ['CC', 'CE', 'TI', 'PAS', 'NIT'] as const;

export class CreateClienteFacturaDto {
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  @IsIn(TIPOS_DOCUMENTO_VALIDOS, {
    message: `tipoDocumento debe ser uno de: ${TIPOS_DOCUMENTO_VALIDOS.join(', ')}`,
  })
  tipoDocumento: string;

  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  @ValidateIf((dto: CreateClienteFacturaDto) => dto.tipoDocumento === 'CC')
  @Matches(/^\d{6,10}$/, {
    message:
      'numeroDocumento para CC debe contener solo números (6 a 10 dígitos)',
  })
  @ValidateIf((dto: CreateClienteFacturaDto) => dto.tipoDocumento === 'TI')
  @Matches(/^\d{10,11}$/, {
    message:
      'numeroDocumento para TI debe contener solo números (10 a 11 dígitos)',
  })
  @ValidateIf((dto: CreateClienteFacturaDto) => dto.tipoDocumento === 'CE')
  @Matches(/^\d{6,12}$/, {
    message:
      'numeroDocumento para CE debe contener solo números (6 a 12 dígitos)',
  })
  @ValidateIf((dto: CreateClienteFacturaDto) => dto.tipoDocumento === 'NIT')
  @Matches(/^\d{8,10}(-\d)?$/, {
    message:
      'numeroDocumento para NIT debe tener 8 a 10 dígitos y puede incluir guion con dígito verificador (ej: 900123456-7)',
  })
  @ValidateIf((dto: CreateClienteFacturaDto) => dto.tipoDocumento === 'PAS')
  @Matches(/^[A-Za-z0-9]{5,20}$/, {
    message:
      'numeroDocumento para PAS debe ser alfanumérico (5 a 20 caracteres, sin espacios)',
  })
  numeroDocumento: string;

  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idUsuario?: number;
}
