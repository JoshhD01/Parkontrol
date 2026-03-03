import { Pago } from './pago.model';

export interface ClienteFactura {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
}

export interface FacturaElectronica {
  id: number;
  idPago: number;
  idClienteFactura?: number;
  tipoFactura?: 'NORMAL' | 'ELECTRONICA';
  cufe?: string | null;
  urlPdf?: string;
  enviada: boolean;
  fechaEmision: string;
  pago?: Pago;
  clienteFactura?: ClienteFactura;
}

export interface CrearClienteFacturaDto {
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
}

export interface CrearFacturaElectronicaDto {
  idPago: number;
  idClienteFactura?: number;
  emitirElectronica?: boolean;
  cufe?: string;
  correoElectronico?: string;
  urlPdf?: string;
}