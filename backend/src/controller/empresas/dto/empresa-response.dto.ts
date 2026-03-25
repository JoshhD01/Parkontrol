import { Empresa } from "src/entities/empresas/entities/empresa.entity";

export class EmpresaResponseDto {
  id: number;
  nombre: string;

  constructor(empresa: Empresa) {
    this.id = empresa.id;
    this.nombre = empresa.nombre;
  }
}
