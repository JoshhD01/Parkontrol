import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ReservasService } from './reservas.service';
import { Reserva } from 'src/entities/reservas/entities/reserva.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';

describe('ReservasService', () => {
  let service: ReservasService;

  let reservaRepository: any;
  let clienteFacturaRepository: any;
  let vehiculosService: any;
  let celdasService: any;

  beforeEach(async () => {

    reservaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    clienteFacturaRepository = {
      findOne: jest.fn(),
    };

    vehiculosService = {
      findVehiculoById: jest.fn(),
      findByPlaca: jest.fn(),
      crear: jest.fn(),
    };

    celdasService = {
      findCeldaById: jest.fn(),
      actualizarEstado: jest.fn(),
      findByParqueadero: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: getRepositoryToken(Reserva), useValue: reservaRepository },
        { provide: getRepositoryToken(ClienteFactura), useValue: clienteFacturaRepository },
        { provide: vehiculosService.constructor, useValue: vehiculosService },
        { provide: celdasService.constructor, useValue: celdasService },
      ],
    }).compile();

    service = module.get<ReservasService>(ReservasService);

    jest.spyOn(service, 'sincronizarEstadosPorHorario').mockResolvedValue();
  });

  afterEach(() => jest.clearAllMocks());
});