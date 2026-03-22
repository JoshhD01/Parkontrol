// pagos.service.helpers.ts

// Importamos herramientas de Nest para crear un módulo de pruebas
import { Test, TestingModule } from '@nestjs/testing';

// Importamos una función de TypeORM para identificar repositorios
import { getRepositoryToken } from '@nestjs/typeorm';

import { PagosService } from '../pagos.service';
import { Pago } from '../entities/pago.entity';
import { MetodoPago } from 'src/shared/entities/metodo-pago.entity';

// Importamos los servicios de los que depende PagosService
import { ReservasService } from 'src/reservas/reservas.service';
import { TarifasService } from 'src/tarifas/tarifas.service';

// Esta función crea todo el entorno de prueba para PagosService
export async function createTestingModule() {
  
  // Simulamos el repositorio de pagos con funciones falsas de Jest
  const pagoRepository = {
    findOne: jest.fn(),            // simula buscar un pago
    find: jest.fn(),               // simula listar pagos
    create: jest.fn(),             // simula crear un objeto pago
    save: jest.fn(),               // simula guardar un pago
    createQueryBuilder: jest.fn(), // simula construir consultas más complejas
  };

  // Simulamos el repositorio de métodos de pago
  const metodoPagoRepository = {
    findOne: jest.fn(), // simula buscar un método de pago
  };

  // Simulamos el servicio de reservas
  const reservasService = {
    findReservaById: jest.fn(), // simula buscar una reserva por id
    finalizarReserva: jest.fn(), // simula finalizar una reserva
  };

  // Simulamos el servicio de tarifas
  const tarifasService = {
    findByParqueaderoYTipo: jest.fn(), // simula buscar una tarifa
  };

  // Creamos un módulo de pruebas de NestJS
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      // Registramos el servicio real que queremos probar
      PagosService,

      // Reemplazamos el repositorio real de Pago por el mock pagoRepository
      { provide: getRepositoryToken(Pago), useValue: pagoRepository },

      // Reemplazamos el repositorio real de MetodoPago por el mock metodoPagoRepository
      { provide: getRepositoryToken(MetodoPago), useValue: metodoPagoRepository },

      // Reemplazamos los servicios reales por versiones simuladas
      { provide: ReservasService, useValue: reservasService },
      { provide: TarifasService, useValue: tarifasService },
    ],
  }).compile();

  // Obtenemos la instancia del servicio ya lista para probar
  const service = module.get<PagosService>(PagosService);

  // Retornamos todo lo necesario para usar en los tests
  return {
    service,                // el servicio real
    pagoRepository,         // mock del repositorio de pagos
    metodoPagoRepository,   // mock del repositorio de métodos de pago
    reservasService,        // mock del servicio de reservas
    tarifasService,         // mock del servicio de tarifas
  };
}