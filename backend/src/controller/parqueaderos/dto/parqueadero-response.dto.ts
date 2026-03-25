import { Parqueadero } from "src/entities/parqueaderos/entities/parqueadero.entity";

export class ParqueaderoResponseDto {
  id: number;
  nombre: string;
  capacidadTotal: number;
  ubicacion: string;
  idEmpresa: number;

  constructor(parqueadero: Parqueadero) {
    this.id = parqueadero.id;
    this.nombre = parqueadero.nombre;
    this.capacidadTotal = parqueadero.capacidadTotal;
    this.ubicacion = parqueadero.ubicacion;
    this.idEmpresa = parqueadero.empresa?.id;
  }
}
