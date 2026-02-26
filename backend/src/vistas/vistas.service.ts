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
        // Convert DB column names (UPPERCASE_WITH_UNDERSCORES) to camelCase
        const camelKey = key
          .toLowerCase()
          .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        transformed[camelKey] = row[key];
      }
      return transformed;
    });
  }

  private async queryOcupacionFallback(idEmpresa: number | null): Promise<any[]> {
    return await this.dataSource.query(
      `SELECT
         p."ID_PARQUEADERO",
         p."NOMBRE" AS "NOMBRE_PARQUEADERO",
         e."NOMBRE" AS "NOMBRE_EMPRESA",
         COUNT(c."ID_CELDA") AS "TOTAL_CELDAS",
         COALESCE(SUM(CASE WHEN c."ESTADO" = 'OCUPADA' THEN 1 ELSE 0 END), 0) AS "CELDAS_OCUPADAS",
         COALESCE(SUM(CASE WHEN c."ESTADO" = 'LIBRE' THEN 1 ELSE 0 END), 0) AS "CELDAS_LIBRES"
       FROM "PARQUEADERO" p
       JOIN "EMPRESA" e ON e."ID_EMPRESA" = p."ID_EMPRESA"
       LEFT JOIN "CELDA" c ON c."ID_PARQUEADERO" = p."ID_PARQUEADERO"
       WHERE ($1::int IS NULL OR p."ID_EMPRESA" = $1)
       GROUP BY p."ID_PARQUEADERO", p."NOMBRE", e."NOMBRE"
       ORDER BY p."ID_PARQUEADERO"`,
      [idEmpresa],
    );
  }

  private async queryOcupacionByParqueaderoFallback(
    idParqueadero: number,
  ): Promise<any[]> {
    return await this.dataSource.query(
      `SELECT
         p."ID_PARQUEADERO",
         p."NOMBRE" AS "NOMBRE_PARQUEADERO",
         e."NOMBRE" AS "NOMBRE_EMPRESA",
         COUNT(c."ID_CELDA") AS "TOTAL_CELDAS",
         COALESCE(SUM(CASE WHEN c."ESTADO" = 'OCUPADA' THEN 1 ELSE 0 END), 0) AS "CELDAS_OCUPADAS",
         COALESCE(SUM(CASE WHEN c."ESTADO" = 'LIBRE' THEN 1 ELSE 0 END), 0) AS "CELDAS_LIBRES"
       FROM "PARQUEADERO" p
       JOIN "EMPRESA" e ON e."ID_EMPRESA" = p."ID_EMPRESA"
       LEFT JOIN "CELDA" c ON c."ID_PARQUEADERO" = p."ID_PARQUEADERO"
       WHERE p."ID_PARQUEADERO" = $1
       GROUP BY p."ID_PARQUEADERO", p."NOMBRE", e."NOMBRE"`,
      [idParqueadero],
    );
  }

  private async queryFacturacionFallback(idEmpresa: number | null): Promise<any[]> {
    return await this.dataSource.query(
      `SELECT
         fe."ID_FACTURA_ELECTRONICA",
         cf."TIPO_DOCUMENTO",
         cf."NUMERO_DOCUMENTO",
         cf."CORREO",
         pg."ID_PAGO",
         pg."MONTO",
         mp."NOMBRE" AS "METODO_PAGO",
         pg."FECHA_PAGO",
         fe."CUFE",
         fe."URL_PDF",
         fe."ENVIADA"
       FROM "FACTURA_ELECTRONICA" fe
       JOIN "CLIENTE_FACTURA" cf ON cf."ID_CLIENTE_FACTURA" = fe."ID_CLIENTE_FACTURA"
       JOIN "PAGO" pg ON pg."ID_PAGO" = fe."ID_PAGO"
       JOIN "METODO_PAGO" mp ON mp."ID_METODO_PAGO" = pg."ID_METODO_PAGO"
       JOIN "RESERVA" r ON r."ID_RESERVA" = pg."ID_RESERVA"
       JOIN "CELDA" c ON c."ID_CELDA" = r."ID_CELDA"
       JOIN "PARQUEADERO" p ON p."ID_PARQUEADERO" = c."ID_PARQUEADERO"
       WHERE ($1::int IS NULL OR p."ID_EMPRESA" = $1)
       ORDER BY fe."ID_FACTURA_ELECTRONICA" DESC`,
      [idEmpresa],
    );
  }

  private async queryFacturacionByDocumentoFallback(
    numeroDocumento: string,
    idEmpresa: number | null,
  ): Promise<any[]> {
    return await this.dataSource.query(
      `SELECT
         fe."ID_FACTURA_ELECTRONICA",
         cf."TIPO_DOCUMENTO",
         cf."NUMERO_DOCUMENTO",
         cf."CORREO",
         pg."ID_PAGO",
         pg."MONTO",
         mp."NOMBRE" AS "METODO_PAGO",
         pg."FECHA_PAGO",
         fe."CUFE",
         fe."URL_PDF",
         fe."ENVIADA"
       FROM "FACTURA_ELECTRONICA" fe
       JOIN "CLIENTE_FACTURA" cf ON cf."ID_CLIENTE_FACTURA" = fe."ID_CLIENTE_FACTURA"
       JOIN "PAGO" pg ON pg."ID_PAGO" = fe."ID_PAGO"
       JOIN "METODO_PAGO" mp ON mp."ID_METODO_PAGO" = pg."ID_METODO_PAGO"
       JOIN "RESERVA" r ON r."ID_RESERVA" = pg."ID_RESERVA"
       JOIN "CELDA" c ON c."ID_CELDA" = r."ID_CELDA"
       JOIN "PARQUEADERO" p ON p."ID_PARQUEADERO" = c."ID_PARQUEADERO"
       WHERE cf."NUMERO_DOCUMENTO" = $1
         AND ($2::int IS NULL OR p."ID_EMPRESA" = $2)
       ORDER BY fe."ID_FACTURA_ELECTRONICA" DESC`,
      [numeroDocumento, idEmpresa],
    );
  }

  private async queryIngresosFallback(idEmpresa: number | null): Promise<any[]> {
    return await this.dataSource.query(
      `SELECT
         e."NOMBRE" AS "EMPRESA",
         p."NOMBRE" AS "PARQUEADERO",
         COALESCE(TO_CHAR(DATE_TRUNC('month', pg."FECHA_PAGO"), 'YYYY-MM'), 'SIN_PAGOS') AS "PERIODO",
         COALESCE(SUM(pg."MONTO"), 0) AS "TOTAL_INGRESOS"
       FROM "PARQUEADERO" p
       JOIN "EMPRESA" e ON e."ID_EMPRESA" = p."ID_EMPRESA"
       LEFT JOIN "CELDA" c ON c."ID_PARQUEADERO" = p."ID_PARQUEADERO"
       LEFT JOIN "RESERVA" r ON r."ID_CELDA" = c."ID_CELDA"
       LEFT JOIN "PAGO" pg ON pg."ID_RESERVA" = r."ID_RESERVA"
       WHERE ($1::int IS NULL OR p."ID_EMPRESA" = $1)
       GROUP BY
         e."NOMBRE",
         p."NOMBRE",
         DATE_TRUNC('month', pg."FECHA_PAGO")
       ORDER BY p."NOMBRE", "PERIODO" DESC`,
      [idEmpresa],
    );
  }

  private async queryIngresosByParqueaderoFallback(
    idParqueadero: number,
  ): Promise<any[]> {
    return await this.dataSource.query(
      `SELECT
         e."NOMBRE" AS "EMPRESA",
         p."NOMBRE" AS "PARQUEADERO",
         COALESCE(TO_CHAR(DATE_TRUNC('month', pg."FECHA_PAGO"), 'YYYY-MM'), 'SIN_PAGOS') AS "PERIODO",
         COALESCE(SUM(pg."MONTO"), 0) AS "TOTAL_INGRESOS"
       FROM "PARQUEADERO" p
       JOIN "EMPRESA" e ON e."ID_EMPRESA" = p."ID_EMPRESA"
       LEFT JOIN "CELDA" c ON c."ID_PARQUEADERO" = p."ID_PARQUEADERO"
       LEFT JOIN "RESERVA" r ON r."ID_CELDA" = c."ID_CELDA"
       LEFT JOIN "PAGO" pg ON pg."ID_RESERVA" = r."ID_RESERVA"
       WHERE p."ID_PARQUEADERO" = $1
       GROUP BY e."NOMBRE", p."NOMBRE", DATE_TRUNC('month', pg."FECHA_PAGO")
       ORDER BY "PERIODO" DESC`,
      [idParqueadero],
    );
  }

  private async queryHistorialFallback(idEmpresa: number | null): Promise<any[]> {
    return await this.dataSource.query(
      `SELECT
         r."ID_RESERVA",
         v."PLACA",
         tv."NOMBRE" AS "TIPO_VEHICULO",
         c."ID_CELDA",
         p."NOMBRE" AS "PARQUEADERO",
         r."FECHA_ENTRADA",
         r."FECHA_SALIDA",
         r."ESTADO"
       FROM "RESERVA" r
       JOIN "VEHICULO" v ON v."ID_VEHICULO" = r."ID_VEHICULO"
       JOIN "TIPO_VEHICULO" tv ON tv."ID_TIPO_VEHICULO" = v."ID_TIPO_VEHICULO"
       JOIN "CELDA" c ON c."ID_CELDA" = r."ID_CELDA"
       JOIN "PARQUEADERO" p ON p."ID_PARQUEADERO" = c."ID_PARQUEADERO"
       WHERE ($1::int IS NULL OR p."ID_EMPRESA" = $1)
       ORDER BY r."FECHA_ENTRADA" DESC`,
      [idEmpresa],
    );
  }

  private async queryHistorialByPlacaAndParqueaderoFallback(
    placa: string,
    idParqueadero: number,
  ): Promise<any[]> {
    return await this.dataSource.query(
      `SELECT
         r."ID_RESERVA",
         v."PLACA",
         tv."NOMBRE" AS "TIPO_VEHICULO",
         c."ID_CELDA",
         p."NOMBRE" AS "PARQUEADERO",
         r."FECHA_ENTRADA",
         r."FECHA_SALIDA",
         r."ESTADO"
       FROM "RESERVA" r
       JOIN "VEHICULO" v ON v."ID_VEHICULO" = r."ID_VEHICULO"
       JOIN "TIPO_VEHICULO" tv ON tv."ID_TIPO_VEHICULO" = v."ID_TIPO_VEHICULO"
       JOIN "CELDA" c ON c."ID_CELDA" = r."ID_CELDA"
       JOIN "PARQUEADERO" p ON p."ID_PARQUEADERO" = c."ID_PARQUEADERO"
       WHERE UPPER(v."PLACA") = UPPER($1)
         AND p."ID_PARQUEADERO" = $2
       ORDER BY r."FECHA_ENTRADA" DESC`,
      [placa, idParqueadero],
    );
  }

  async getOcupacionByEmpresa(idEmpresa: number | null): Promise<any[]> {
    const result = await this.queryOcupacionFallback(idEmpresa);
    return this.transformKeys(result);
  }

  async getOcupacionByParqueadero(idParqueadero: number): Promise<any> {
    const result = await this.queryOcupacionByParqueaderoFallback(idParqueadero);
    const transformed = this.transformKeys(result);
    return transformed[0] || null;
  }

  async getHistorialByEmpresa(idEmpresa: number | null): Promise<any[]> {
    const result = await this.queryHistorialFallback(idEmpresa);
    return this.transformKeys(result);
  }

  async getHistorialByPlacaAndParqueadero(
    placa: string,
    idParqueadero: number,
  ): Promise<any[]> {
    const result = await this.queryHistorialByPlacaAndParqueaderoFallback(
      placa,
      idParqueadero,
    );
    return this.transformKeys(result);
  }

  async getFacturacionByEmpresa(idEmpresa: number | null): Promise<any[]> {
    const result = await this.queryFacturacionFallback(idEmpresa);
    return this.transformKeys(result);
  }

  async getFacturacionByDocumento(
    numeroDocumento: string,
    idEmpresa: number | null,
  ): Promise<any[]> {
    const result = await this.queryFacturacionByDocumentoFallback(
      numeroDocumento,
      idEmpresa,
    );
    return this.transformKeys(result);
  }

  async getIngresosByEmpresa(idEmpresa: number | null): Promise<any[]> {
    const result = await this.queryIngresosFallback(idEmpresa);
    return this.transformKeys(result);
  }

  async getIngresosByParqueadero(idParqueadero: number): Promise<any[]> {
    const result = await this.queryIngresosByParqueaderoFallback(idParqueadero);
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
