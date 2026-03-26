import { Component, OnInit } from '@angular/core';
import { FacturacionService } from '../../services/facturacion.service';
import { AuthService } from '../../services/autenticacion.service';
import { ClienteFactura, CrearClienteFacturaDto } from '../../models/facturacion.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ClientesFacturaComponent } from '../../components/clientes-factura/clientes-factura.component';
import { FacturasListaComponent } from '../../components/facturas-lista/facturas-lista.component';
import { VistasService } from '../../services/vistas.service';
import { FacturacionCompleta } from '../../models/vistas.model';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    ClientesFacturaComponent,
    FacturasListaComponent
  ],
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.scss']
})

export class FacturacionComponent implements OnInit {
  clientesFactura: ClienteFactura[] = [];
  facturas: FacturacionCompleta[] = [];
  idEmpresa: number | null = null;
  loading = false;
  mensajeExito: string = '';
  errorMessage: string = '';

  peticionesCompletadas = 0;
  totalPeticiones = 2;

  constructor(
    private readonly facturacionService: FacturacionService,
    private readonly authService: AuthService,
    private readonly vistasService: VistasService
  ) {}

  ngOnInit(): void {

    const usuario = this.authService.getUsuarioActual();
    this.idEmpresa = usuario?.idEmpresa || null;

    if (this.idEmpresa) {
      this.loading = true;
      this.cargarClientesFactura();
      this.cargarFacturas();
    }
  }

  cargarClientesFactura(): void {
    this.facturacionService.obtenerClientesFactura().subscribe({
      next: (clientes: ClienteFactura[]) => {
        this.clientesFactura = clientes;
      },
      error: () => { this.clientesFactura = []; },
      complete: () => this.validarPeticiones()
    });
  }

  cargarFacturas(): void {
    if (!this.idEmpresa) return;
    this.vistasService.getFacturacion(this.idEmpresa).subscribe({
      next: (facturas: FacturacionCompleta[]) => {
        this.facturas = facturas;
      },
      error: () => { this.facturas = []; },
      complete: () => this.validarPeticiones()
    });
  }

  onCrearFactura(facturaDto: any) {
    if (!this.idEmpresa) return;
    this.loading = true;

    this.facturacionService.crearFactura(facturaDto).subscribe({

      next: (nuevaFactura) => {
        if (nuevaFactura) {
          this.cargarFacturas();
        }

        this.mensajeExito = 'Factura creada exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.mensajeExito = '';
        }, 4000);
      },
      error: () => {
        
        this.errorMessage = 'Error al crear la factura.';
        setTimeout(() => this.errorMessage = '', 4000);
        this.loading = false;
      }
    });
  }

  onClienteCreado(dto: CrearClienteFacturaDto) {

    if (!this.idEmpresa) return;
    this.loading = true;
    
    this.facturacionService.crearClienteFactura(dto).subscribe({
      next: (nuevoCliente) => {
        if (nuevoCliente) {
          this.cargarClientesFactura();
        }

        this.mensajeExito = `Cliente con numero documento ${nuevoCliente.numeroDocumento} creado exitosamente`;
        this.loading = false;
        setTimeout(() => {
          this.mensajeExito = '';
        }, 4000);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private validarPeticiones(): void {
    this.peticionesCompletadas++;
    if (this.peticionesCompletadas === this.totalPeticiones) {
      this.loading = false;
    }
  }
}