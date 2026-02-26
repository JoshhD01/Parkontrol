import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OcupacionParqueaderoView } from './entities/ocupacion-parqueadero.view';
import { HistorialReservasView } from './entities/historial-reservas.view';
import { FacturacionCompletaView } from './entities/facturacion-completa.view';
import { IngresosPorParqueaderoMensualView } from './entities/ingresos-parqueadero-mensual.view';

export interface ProcControlPagoResult {
  monto: number;
}

export interface ProcBuscarPlacaResult {
  mensaje: string;
}

@Injectable()
export class VistasService {
  constructor(
    @InjectRepository(OcupacionParqueaderoView)
    private readonly ocupacionRepo: Repository<OcupacionParqueaderoView>,
    @InjectRepository(HistorialReservasView)
    private readonly historialRepo: Repository<HistorialReservasView>,
    @InjectRepository(FacturacionCompletaView)
    private readonly facturacionRepo: Repository<FacturacionCompletaView>,
    @InjectRepository(IngresosPorParqueaderoMensualView)
    private readonly ingresosRepo: Repository<IngresosPorParqueaderoMensualView>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private transformKeys(data: any[]): any[] {
    return data.map((row) => {
      const transformed: any = {};
      for (const key in row) {
        // Convert Oracle column names (UPPERCASE_WITH_UNDERSCORES) to camelCase
        const camelKey = key
          .toLowerCase()
          .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        transformed[camelKey] = row[key];
      }
      return transformed;
    });
  }

  async getOcupacionByEmpresa(idEmpresa: number | null): Promise<any[]> {
    let result;
    if (idEmpresa === null) {
      result = await this.dataSource.query(
        `SELECT * FROM "VW_OCUPACION_PARQUEADERO"`,
      );
    } else {
      result = await this.dataSource.query(
        `SELECT v.* FROM "VW_OCUPACION_PARQUEADERO" v 
         JOIN "PARQUEADERO" p ON v."ID_PARQUEADERO" = p."ID_PARQUEADERO" 
         WHERE p."ID_EMPRESA" = $1`,
        [idEmpresa],
      );
    }
    return this.transformKeys(result);
  }

  async getOcupacionByParqueadero(idParqueadero: number): Promise<any> {
    const result = await this.dataSource.query(
      `SELECT * FROM "VW_OCUPACION_PARQUEADERO" WHERE "ID_PARQUEADERO" = $1`,
      [idParqueadero],
    );
    const transformed = this.transformKeys(result);
    return transformed[0] || null;
  }

  async getHistorialByEmpresa(idEmpresa: number | null): Promise<any[]> {
    let result;
    if (idEmpresa === null) {
      result = await this.dataSource.query(
        `SELECT * FROM "VW_HISTORIAL_RESERVAS"`,
      );
    } else {
      result = await this.dataSource.query(
        `SELECT v.* FROM "VW_HISTORIAL_RESERVAS" v 
         JOIN "CELDA" c ON v."ID_CELDA" = c."ID_CELDA" 
         JOIN "PARQUEADERO" p ON c."ID_PARQUEADERO" = p."ID_PARQUEADERO" 
         WHERE p."ID_EMPRESA" = $1`,
        [idEmpresa],
      );
    }
    return this.transformKeys(result);
  }

  async getHistorialByPlacaAndParqueadero(
    placa: string,
    idParqueadero: number,
  ): Promise<any[]> {
    const result = await this.dataSource.query(
      `SELECT v.* FROM "VW_HISTORIAL_RESERVAS" v 
       JOIN "CELDA" c ON v."ID_CELDA" = c."ID_CELDA" 
       WHERE v."PLACA" = $1 AND c."ID_PARQUEADERO" = $2`,
      [placa, idParqueadero],
    );
    return this.transformKeys(result);
  }

  async getFacturacionByEmpresa(idEmpresa: number | null): Promise<any[]> {
    let result;
    if (idEmpresa === null) {
      result = await this.dataSource.query(
        `SELECT * FROM "VW_FACTURACION_COMPLETA"`,
      );
    } else {
      result = await this.dataSource.query(
        `SELECT v.* FROM "VW_FACTURACION_COMPLETA" v 
         JOIN "PAGO" pg ON v."ID_PAGO" = pg."ID_PAGO" 
         JOIN "RESERVA" r ON pg."ID_RESERVA" = r."ID_RESERVA" 
         JOIN "CELDA" c ON r."ID_CELDA" = c."ID_CELDA" 
         JOIN "PARQUEADERO" p ON c."ID_PARQUEADERO" = p."ID_PARQUEADERO" 
         WHERE p."ID_EMPRESA" = $1`,
        [idEmpresa],
      );
    }
    return this.transformKeys(result);
  }

  async getFacturacionByDocumento(
    numeroDocumento: string,
    idEmpresa: number | null,
  ): Promise<any[]> {
    let result;
    if (idEmpresa === null) {
      result = await this.dataSource.query(
        `SELECT * FROM "VW_FACTURACION_COMPLETA" WHERE "NUMERO_DOCUMENTO" = $1`,
        [numeroDocumento],
      );
    } else {
      result = await this.dataSource.query(
        `SELECT v.* FROM "VW_FACTURACION_COMPLETA" v 
         JOIN "PAGO" pg ON v."ID_PAGO" = pg."ID_PAGO" 
         JOIN "RESERVA" r ON pg."ID_RESERVA" = r."ID_RESERVA" 
         JOIN "CELDA" c ON r."ID_CELDA" = c."ID_CELDA" 
         JOIN "PARQUEADERO" p ON c."ID_PARQUEADERO" = p."ID_PARQUEADERO" 
         WHERE v."NUMERO_DOCUMENTO" = $1 AND p."ID_EMPRESA" = $2`,
        [numeroDocumento, idEmpresa],
      );
    }
    return this.transformKeys(result);
  }

  async getIngresosByEmpresa(idEmpresa: number | null): Promise<any[]> {
    let result;
    if (idEmpresa === null) {
      result = await this.dataSource.query(
        `SELECT * FROM "VW_INGRESOS_POR_PARQUEADERO_MENSUAL"`,
      );
    } else {
      result = await this.dataSource.query(
        `SELECT v.* FROM "VW_INGRESOS_POR_PARQUEADERO_MENSUAL" v 
         JOIN "PARQUEADERO" p ON v."PARQUEADERO" = p."NOMBRE" 
         WHERE p."ID_EMPRESA" = $1`,
        [idEmpresa],
      );
    }
    return this.transformKeys(result);
  }

  async getIngresosByParqueadero(idParqueadero: number): Promise<any[]> {
    const result = await this.dataSource.query(
      `SELECT v.* FROM "VW_INGRESOS_POR_PARQUEADERO_MENSUAL" v 
       JOIN "PARQUEADERO" p ON v."PARQUEADERO" = p."NOMBRE" 
       WHERE p."ID_PARQUEADERO" = $1`,
      [idParqueadero],
    );
    return this.transformKeys(result);
  }

  async procesarPago(
    idReserva: number,
    idMetodoPago: number,
  ): Promise<ProcControlPagoResult> {
    const result = await this.dataSource.query(
      `SELECT "PROC_CONTROL_PAGO"($1, $2) AS monto`,
      [idReserva, idMetodoPago],
    );

    return { monto: Number(result?.[0]?.monto ?? 0) };
  }

  async buscarVehiculoPorPlaca(placa: string): Promise<ProcBuscarPlacaResult> {
    const result = await this.dataSource.query(
      `SELECT "PROC_BUSCAR_PLACA"($1) AS mensaje`,
      [placa],
    );

    return { mensaje: String(result?.[0]?.mensaje ?? '') };
  }
}
