import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateVehiculoDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  placa: string;

  @IsNotEmpty()
  @IsNumber()
  idTipoVehiculo: number;
}
