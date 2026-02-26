import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsString, Matches, Min } from 'class-validator';

export class ReservarClienteDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idParqueadero: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9-]{5,10}$/)
  placa: string;

  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2], { message: 'idTipoVehiculo debe ser 1 (particular) o 2 (moto)' })
  idTipoVehiculo: number;
}
