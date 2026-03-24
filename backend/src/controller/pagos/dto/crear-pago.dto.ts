import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePagoDto {
  @IsNotEmpty()
  @IsNumber()
  idReserva: number;

  @IsNotEmpty()
  @IsNumber()
  idMetodoPago: number;
}
