import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
	ClienteFactura,
	FacturaElectronica,
	CrearClienteFacturaDto,
	CrearFacturaElectronicaDto
} from '../models/facturacion.model';

@Injectable({ providedIn: 'root' })
export class FacturacionService {
	private apiUrl = environment.urlApi;

	constructor(private http: HttpClient) {}

	obtenerClientesFactura(): Observable<ClienteFactura[]> {
		return this.http.get<ClienteFactura[]>(`${this.apiUrl}/invoicing/clientes`);
	}

	crearClienteFactura(dto: CrearClienteFacturaDto): Observable<ClienteFactura> {
		return this.http.post<ClienteFactura>(`${this.apiUrl}/invoicing/clientes`, dto);
	}

	getFacturas(idEmpresa: number): Observable<FacturaElectronica[]> {
		return this.http.get<FacturaElectronica[]>(`${this.apiUrl}/invoicing/facturas?idEmpresa=${idEmpresa}`);
	}

	crearFactura(dto: CrearFacturaElectronicaDto): Observable<FacturaElectronica> {
		return this.http.post<FacturaElectronica>(`${this.apiUrl}/invoicing/facturas`, dto);
	}

	marcarFacturaEnviada(id: number): Observable<FacturaElectronica> {
		return this.http.patch<FacturaElectronica>(`${this.apiUrl}/invoicing/facturas/${id}/enviar`, {});
	}

	getFacturaPorPago(idPago: number): Observable<FacturaElectronica> {
		return this.http.get<FacturaElectronica>(`${this.apiUrl}/invoicing/facturas/pago/${idPago}`);
	}

	getMisFacturasCliente(): Observable<FacturaElectronica[]> {
		return this.http.get<FacturaElectronica[]>(`${this.apiUrl}/invoicing/facturas/client/mias`);
	}
}

