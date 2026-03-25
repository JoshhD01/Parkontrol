import { IsNotEmpty, IsNumber } from 'class-validator';

export class ProcesarPagoDto {
  @IsNotEmpty()
  @IsNumber()
  idReserva: number;

  @IsNotEmpty()
  @IsNumber()
  idMetodoPago: number;
}
