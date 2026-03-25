import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateEmpresaDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  nombre: string;
}
