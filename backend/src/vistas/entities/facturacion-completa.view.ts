import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'VW_FACTURACION_COMPLETA',
  synchronize: false,
})
export class FacturacionCompletaView {
  @ViewColumn({ name: 'ID_FACTURA_ELECTRONICA' })
  idFacturaElectronica: number;

  @ViewColumn({ name: 'TIPO_DOCUMENTO' })
  tipoDocumento: string;

  @ViewColumn({ name: 'NUMERO_DOCUMENTO' })
  numeroDocumento: string;

  @ViewColumn({ name: 'CORREO' })
  correo: string;

  @ViewColumn({ name: 'ID_PAGO' })
  idPago: number;

  @ViewColumn({ name: 'MONTO' })
  monto: number;

  @ViewColumn({ name: 'METODO_PAGO' })
  metodoPago: string;

  @ViewColumn({ name: 'FECHA_PAGO' })
  fechaPago: Date;

  @ViewColumn({ name: 'CUFE' })
  cufe: string;

  @ViewColumn({ name: 'URL_PDF' })
  urlPdf: string;

  @ViewColumn({ name: 'ENVIADA' })
  enviada: boolean;

  @ViewColumn({ name: 'TIPO_FACTURA' })
  tipoFactura: string;
}
