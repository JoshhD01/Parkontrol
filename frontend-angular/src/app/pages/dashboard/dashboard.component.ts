import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/autenticacion.service';
import { VistasService } from '../../services/vistas.service';
import { ReservasService } from '../../services/reservas.service';
import { EmpresasService } from '../../services/empresas.service';
import { OcupacionParqueadero, IngresosMensuales, FacturacionCompleta } from '../../models/vistas.model';
import { Reserva } from '../../models/reserva.model';
import { Empresa } from '../../models/shared.model';
import { OcupacionParqueaderosComponent } from '../../components/ocupacion-parqueaderos/ocupacion-parqueaderos.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    OcupacionParqueaderosComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  ocupacion: OcupacionParqueadero[] = [];
  reservasActivas: Reserva[] = [];
  ingresos: IngresosMensuales[] = [];
  facturacion: FacturacionCompleta[] = [];
  empresaUsuario: Empresa | null = null;

  loading = true;
  totalParqueaderos = 0;
  totalCeldasOcupadas = 0;
  totalCeldasDisponibles = 0;
  totalReservasActivas = 0;
  ingresosTotal = 0;
  totalFacturas = 0;
  promedioOcupacion = 0;
   private peticionesCompletadas = 0;
  private totalPeticiones = 4;

  constructor(
    private authService: AuthService,
    private vistasService: VistasService,
    private reservasService: ReservasService,
    private empresasService: EmpresasService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }


  private cargarDashboard(): void {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      console.error('No hay usuario autenticado');
      this.loading = false;
      return;
    }

    this.empresasService.getById(usuario.idEmpresa).subscribe({
      next: (empresa) => {
        this.empresaUsuario = empresa;
      },
      error: (error) => {
        console.error('Error cargando empresa', error);
        this.loading = false;
        return;
      }
    });

    this.cargarDatosDashboard(usuario.idEmpresa);
  }



  private cargarDatosDashboard(idEmpresa: number): void {
    this.loading = true;
    this.peticionesCompletadas = 0; 

    this.vistasService.getOcupacion(idEmpresa)
      .subscribe({
        next: (data) => {
          this.ocupacion = data;
        },
        error: (error) => {
          console.log('no recibe ocupacion', error);
          this.ocupacion = [];
          this.validarPeticiones();
        },
        complete: () => {
          this.validarPeticiones(); 
        }
      });

    this.reservasService.getActivas()
      .subscribe({
        next: (data) => {
          this.reservasActivas = data;
        },
        error: (error) => {
          console.log('No se cargo reservas', error);
          this.reservasActivas = [];
          this.validarPeticiones();
        },
        complete: () => {
          this.validarPeticiones();
        }
      });


    this.vistasService.getIngresos(idEmpresa)
      .subscribe({
        next: (data) => {
          this.ingresos = data;
        },
        error: (error) => {
          console.log('No se cargaron ingresos', error);
          this.ingresos = [];
          this.validarPeticiones();
        },

        complete: () => {
          this.validarPeticiones();
        }
      });



    this.vistasService.getFacturacion(idEmpresa)
      .subscribe({
        next: (data) => {
          this.facturacion = data;
        },
        error: (error) => {
          console.log('No cargo facturacion', error);
          this.facturacion = [];
          this.validarPeticiones();
        },

        complete: () => {
          this.validarPeticiones();
        }
      });
  }

  private validarPeticiones(): void {
    this.peticionesCompletadas++;
    if (this.peticionesCompletadas === this.totalPeticiones) {
      this.calcularEstadisticas();
      this.loading = false;
    }
  }


  private calcularEstadisticas(): void {

    this.totalParqueaderos = this.ocupacion.length;
    this.totalReservasActivas = this.reservasActivas.length;
    this.totalFacturas = this.facturacion.length;
    this.totalCeldasOcupadas = this.ocupacion.reduce((total, parqueadero) => total + (parqueadero.celdasOcupadas || 0), 0);
    this.totalCeldasDisponibles = this.ocupacion.reduce((total, parqueadero) => total + (parqueadero.celdasLibres || 0), 0);
    this.ingresosTotal = this.ingresos.reduce((total, ingreso) => total + (ingreso.totalIngresos || 0), 0);


    if (this.ocupacion.length > 0) {
      let sumaPromedios = 0;
      for (const parqueadero of this.ocupacion) {
        const porcentaje = parqueadero.totalCeldas > 0 
          ? (parqueadero.celdasOcupadas / parqueadero.totalCeldas * 100) 
          : 0;
        sumaPromedios += porcentaje;
      }
      this.promedioOcupacion = sumaPromedios / this.ocupacion.length;
    }
  }

}