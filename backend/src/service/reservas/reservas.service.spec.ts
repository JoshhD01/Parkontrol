import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ReservasService } from './reservas.service';
import { Reserva } from 'src/entities/reservas/entities/reserva.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { VehiculosService } from 'src/service/vehiculos/vehiculos.service';
import { CeldasService } from 'src/service/celdas/celdas.service';

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
      find: jest.fn(),
      findOne: jest.fn(),
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
      findByParqueadero: jest.fn(),
      actualizarEstado: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: getRepositoryToken(Reserva), useValue: reservaRepository },
        { provide: getRepositoryToken(ClienteFactura), useValue: clienteFacturaRepository },
        { provide: VehiculosService, useValue: vehiculosService },
        { provide: CeldasService, useValue: celdasService },
      ],
    }).compile();

    service = module.get<ReservasService>(ReservasService);

  jest
    .spyOn(service, 'sincronizarEstadosPorHorario')
    .mockResolvedValue(undefined);

  jest
    .spyOn<any, any>(service, 'validarReglasReservaActiva')
    .mockResolvedValue(undefined);
    });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const vehiculoMock = { id: 1, placa: 'ABC123', tipoVehiculo: { id: 1 } };
  const celdaLibreMock = { id: 1, estado: 'LIBRE', tipoCelda: { id: 1 } };
  const celdaOcupadaMock = { id: 1, estado: 'OCUPADA' };
  const clienteMock = { id: 1, correo: 'test@mail.com' };
  const reservaMock = { id: 1, estado: 'ABIERTA', celda: { id: 1 } };

  describe('crear', () => {

    it('CS0001 - clienteFactura no existe', async () => {
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        idClienteFactura: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 10000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibreMock);
      clienteFacturaRepository.findOne.mockResolvedValue(null);

      const action = service.crear(dto as any);

      await expect(action).rejects.toThrow(
        `No existe cliente con id: ${dto.idClienteFactura}`,
      );
    });

    it('CS0002 - celda no está libre', async () => {
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 10000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaOcupadaMock);

      const action = service.crear(dto as any);

      await expect(action).rejects.toThrow('La celda no está LIBRE');
    });

    it('CS0003 - fechas inválidas', async () => {
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: 'fecha-mala',
        horaFin: new Date(),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibreMock);

      const action = service.crear(dto as any);

      await expect(action).rejects.toThrow('horaInicio no tiene un formato válido');
    });

    it('CS0004 - horaFin menor a horaInicio', async () => {
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() - 1000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibreMock);

      const action = service.crear(dto as any);

      await expect(action).rejects.toThrow(
        'La hora fin debe ser mayor que la hora inicio',
      );
    });

    it('CS0005 - crea correctamente', async () => {
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 10000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibreMock);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      const result = await service.crear(dto as any);

      expect(reservaRepository.create).toHaveBeenCalled();
      expect(reservaRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

  });

  describe('crearParaCliente', () => {

    it('CS0001 - placa con tipo diferente', async () => {
      vehiculosService.findByPlaca.mockResolvedValue({
        ...vehiculoMock,
        tipoVehiculo: { id: 2 },
      });

      const action = service.crearParaCliente(1, {
        placa: 'ABC',
        idTipoVehiculo: 1,
      } as any);

      await expect(action).rejects.toThrow(
        'La placa ya existe con un tipo de vehículo diferente',
      );
    });

    it('CS0002 - no hay celdas disponibles', async () => {
      vehiculosService.findByPlaca.mockResolvedValue(null);
      vehiculosService.crear.mockResolvedValue(vehiculoMock);
      celdasService.findByParqueadero.mockResolvedValue([]);

      const action = service.crearParaCliente(1, {
        placa: 'ABC',
        idTipoVehiculo: 1,
        idParqueadero: 1,
      } as any);

      await expect(action).rejects.toThrow(
        'No hay celdas disponibles para el tipo de vehículo seleccionado en este parqueadero',
      );
    });

  });

  describe('finalizarReserva', () => {

    it('CS0001 - reserva ya cerrada', async () => {
      jest.spyOn(service, 'findReservaById').mockResolvedValue({
        ...reservaMock,
        estado: 'CERRADA',
      } as any);

      const action = service.finalizarReserva(1);

      await expect(action).rejects.toThrow(
        'La reserva ya ha sido cerrada',
      );
    });

    it('CS0002 - finaliza correctamente', async () => {
      jest.spyOn(service, 'findReservaById').mockResolvedValue(reservaMock as any);

      reservaRepository.save.mockResolvedValue(reservaMock);
      reservaRepository.count.mockResolvedValue(0);

      const result = await service.finalizarReserva(1);

      expect(reservaRepository.save).toHaveBeenCalled();
      expect(celdasService.actualizarEstado).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

  });

  describe('findReservaById', () => {

    it('CS0001 - no existe', async () => {
      reservaRepository.findOne.mockResolvedValue(null);

      const action = service.findReservaById(1);

      await expect(action).rejects.toThrow(
        'No existe reserva con id: 1',
      );
    });

    it('CS0002 - existe', async () => {
      reservaRepository.findOne.mockResolvedValue(reservaMock);

      const result = await service.findReservaById(1);

      expect(result).toBeDefined();
    });

  });

  describe('findByParqueadero', () => {

    it('CS0001 - retorna lista', async () => {
      reservaRepository.find.mockResolvedValue([reservaMock]);

      const result = await service.findByParqueadero(1);

      expect(result).toHaveLength(1);
    });

  });

  describe('findVehiculosByClienteFactura', () => {

    it('CS0001 - retorna únicos', async () => {
      jest.spyOn(service, 'findByClienteFactura').mockResolvedValue([
        { vehiculo: { id: 1 } },
        { vehiculo: { id: 1 } },
      ] as any);

      const result = await service.findVehiculosByClienteFactura(1);

      expect(result).toHaveLength(1);
    });

  });

});