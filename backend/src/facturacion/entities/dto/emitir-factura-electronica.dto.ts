import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class EmitirFacturaElectronicaDto {
  @IsNotEmpty()
  @IsString()
  cufe: string;

  @IsNotEmpty()
  @IsEmail()
  correoElectronico: string;

  @IsOptional()
  @IsString()
  urlPdf?: string;
}
