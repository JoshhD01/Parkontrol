import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ReservasService } from './reservas.service';
import { Reserva } from 'src/entities/reservas/entities/reserva.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';

import { VehiculosService } from 'src/service/vehiculos/vehiculos.service';
import { CeldasService } from 'src/service/celdas/celdas.service';

describe('ReservasService', () => {
let service: ReservasService;

let reservaRepository: {
  create: jest.Mock;
  save: jest.Mock;
  count: jest.Mock;
};

let clienteFacturaRepository: {
  findOne: jest.Mock;
};

let vehiculosService: {
  findVehiculoById: jest.Mock;
  findByPlaca: jest.Mock;
  crear: jest.Mock;
};

let celdasService: {
  findCeldaById: jest.Mock;
  actualizarEstado: jest.Mock;
  findByParqueadero: jest.Mock;
};

beforeEach(async () => {
    reservaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
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
      {
        provide: getRepositoryToken(ClienteFactura),
        useValue: clienteFacturaRepository,
      },
      { provide: VehiculosService, useValue: vehiculosService },
      { provide: CeldasService, useValue: celdasService },
    ],
  }).compile();

  service = module.get<ReservasService>(ReservasService);

  jest
    .spyOn(service as any, 'sincronizarEstadosPorHorario')
    .mockResolvedValue(undefined);

  jest
    .spyOn(service as any, 'validarReglasReservaActiva')
    .mockResolvedValue(undefined);
});

afterEach(() => {
  jest.clearAllMocks();
});

  const vehiculoMock = { id: 1 };
  const celdaLibre = { id: 1, estado: 'LIBRE' };
  const reservaMock = { id: 1 };

  describe('crear', () => {

    it('CS0001 - idClienteFactura FALSE', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(clienteFacturaRepository.findOne).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('CS0002 - idClienteFactura TRUE', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        idClienteFactura: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      clienteFacturaRepository.findOne.mockResolvedValue({ id: 1 });

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(clienteFacturaRepository.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('CS0003 - clienteFactura no existe', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        idClienteFactura: 10,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      clienteFacturaRepository.findOne.mockResolvedValue(null);

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).rejects.toThrow();
    });

    it('CS0004 - clienteFactura existe', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        idClienteFactura: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      clienteFacturaRepository.findOne.mockResolvedValue({ id: 1 });

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(result).toBeDefined();
    });

    it('CS0005 - celda no libre', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);

      celdasService.findCeldaById.mockResolvedValue({
        id: 1,
        estado: 'OCUPADA',
      });

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).rejects.toThrow();
    });

    it('CS0006 - celda libre', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(result).toBeDefined();
    });

    it('CS0007 - horaInicio inválida', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: 'fecha',
        horaFin: new Date(),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).rejects.toThrow();
    });

    it('CS0008 - horaInicio válida', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(result).toBeDefined();
    });

    it('CS0009 - horaFin inválida', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: 'fecha',
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).rejects.toThrow();
    });

    it('CS0010 - horaFin válida', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(result).toBeDefined();
    });

    it('CS0011 - horaFin <= horaInicio', async () => {

      // Arrange
      const now = new Date();

      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: now,
        horaFin: now,
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      // Act
      const action = service.crear(dto as any);

      // Assert
      await expect(action).rejects.toThrow();
    });

    it('CS0012 - horaFin > horaInicio', async () => {

      // Arrange
      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(),
        horaFin: new Date(Date.now() + 60000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      const result = await service.crear(dto as any);

      // Assert
      expect(result).toBeDefined();
    });

    it('CS0013 - reserva activa ocupa celda', async () => {

      // Arrange
      const now = new Date();

      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(now.getTime() - 1000),
        horaFin: new Date(now.getTime() + 60000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      await service.crear(dto as any);

      // Assert
      expect(celdasService.actualizarEstado).toHaveBeenCalled();
    });

    it('CS0014 - reserva futura no ocupa celda', async () => {

      // Arrange
      const now = new Date();

      const dto = {
        idVehiculo: 1,
        idCelda: 1,
        horaInicio: new Date(now.getTime() + 60000),
        horaFin: new Date(now.getTime() + 120000),
      };

      vehiculosService.findVehiculoById.mockResolvedValue(vehiculoMock);
      celdasService.findCeldaById.mockResolvedValue(celdaLibre);

      reservaRepository.create.mockReturnValue(reservaMock);
      reservaRepository.save.mockResolvedValue(reservaMock);

      // Act
      await service.crear(dto as any);

      // Assert
      expect(celdasService.actualizarEstado).not.toHaveBeenCalled();
    });

  });

describe('crearParaCliente', () => {

  it('CS00001 - placa existe con tipoVehiculo diferente', async () => {

    // Arrange
    const dto = {
      placa: 'ABC123',
      idTipoVehiculo: 2,
      idParqueadero: 1,
      horaInicio: new Date(),
      horaFin: new Date(Date.now() + 60000),
    };

    vehiculosService.findByPlaca.mockResolvedValue({
      id: 1,
      tipoVehiculo: { id: 1 },
    });

    // Act
    const action = service.crearParaCliente(1, dto as any);

    // Assert
    await expect(action).rejects.toThrow(
      'La placa ya existe con un tipo de vehículo diferente',
    );
  });

  it('CS00002 - placa existe con mismo tipoVehiculo', async () => {

    // Arrange
    const dto = {
      placa: 'ABC123',
      idTipoVehiculo: 1,
      idParqueadero: 1,
      horaInicio: new Date(),
      horaFin: new Date(Date.now() + 60000),
    };

    const vehiculoMock = {
      id: 10,
      tipoVehiculo: { id: 1 },
    };

    const celdaMock = {
      id: 5,
      estado: 'LIBRE',
      tipoCelda: { id: 1 },
    };

    vehiculosService.findByPlaca.mockResolvedValue(vehiculoMock);

    celdasService.findByParqueadero.mockResolvedValue([celdaMock]);

    jest.spyOn(service, 'crear').mockResolvedValue({ id: 1 } as any);

    // Act
    const result = await service.crearParaCliente(1, dto as any);

    // Assert
    expect(result).toBeDefined();
    expect(service.crear).toHaveBeenCalled();
  });

  it('CS00003 - no existe vehiculo y no hay celdas libres', async () => {

    // Arrange
    const dto = {
      placa: 'XYZ999',
      idTipoVehiculo: 1,
      idParqueadero: 1,
      horaInicio: new Date(),
      horaFin: new Date(Date.now() + 60000),
    };

    vehiculosService.findByPlaca.mockResolvedValue(null);

    vehiculosService.crear.mockResolvedValue({
      id: 20,
      tipoVehiculo: { id: 1 },
    });

    celdasService.findByParqueadero.mockResolvedValue([]);

    // Act
    const action = service.crearParaCliente(1, dto as any);

    // Assert
    await expect(action).rejects.toThrow(
      'No hay celdas disponibles para el tipo de vehículo seleccionado en este parqueadero',
    );
  });

  it('CS00004 - no existe vehiculo y hay celda libre', async () => {

    // Arrange
    const dto = {
      placa: 'XYZ999',
      idTipoVehiculo: 1,
      idParqueadero: 1,
      horaInicio: new Date(),
      horaFin: new Date(Date.now() + 60000),
    };

    const vehiculoCreado = {
      id: 20,
      tipoVehiculo: { id: 1 },
    };

    const celdaMock = {
      id: 3,
      estado: 'LIBRE',
      tipoCelda: { id: 1 },
    };

    vehiculosService.findByPlaca.mockResolvedValue(null);

    vehiculosService.crear.mockResolvedValue(vehiculoCreado);

    celdasService.findByParqueadero.mockResolvedValue([celdaMock]);

    jest.spyOn(service, 'crear').mockResolvedValue({ id: 99 } as any);

    // Act
    const result = await service.crearParaCliente(1, dto as any);

    // Assert
    expect(result).toBeDefined();
    expect(service.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        idVehiculo: vehiculoCreado.id,
        idCelda: celdaMock.id,
      }),
    );
  });

});
describe('finalizarReserva', () => {

  it('CS00001 - reserva ya cerrada', async () => {

    // Arrange
    const reservaMock = {
      id: 1,
      estado: 'CERRADA',
      celda: { id: 10 },
    };

    jest.spyOn(service, 'findReservaById').mockResolvedValue(reservaMock as any);

    // Act
    const action = service.finalizarReserva(1);

    // Assert
    await expect(action).rejects.toThrow(
      'La reserva ya ha sido cerrada',
    );
  });

  it('CS00002 - reserva abierta y existen reservas activas en la celda', async () => {

    // Arrange
    const reservaMock = {
      id: 1,
      estado: 'ABIERTA',
      celda: { id: 10 },
    };

    jest.spyOn(service, 'findReservaById').mockResolvedValue(reservaMock as any);

    reservaRepository.save.mockResolvedValue({
      ...reservaMock,
      estado: 'CERRADA',
    });

    reservaRepository.count.mockResolvedValue(2);

    // Act
    const result = await service.finalizarReserva(1);

    // Assert
    expect(reservaRepository.save).toHaveBeenCalled();
    expect(celdasService.actualizarEstado).not.toHaveBeenCalled();
    expect(result.estado).toBe('CERRADA');
  });

  it('CS00003 - reserva abierta y no existen reservas activas en la celda', async () => {

    // Arrange
    const reservaMock = {
      id: 1,
      estado: 'ABIERTA',
      celda: { id: 10 },
    };

    jest.spyOn(service, 'findReservaById').mockResolvedValue(reservaMock as any);

    reservaRepository.save.mockResolvedValue({
      ...reservaMock,
      estado: 'CERRADA',
    });

    reservaRepository.count.mockResolvedValue(0);

    // Act
    const result = await service.finalizarReserva(1);

    // Assert
    expect(celdasService.actualizarEstado).toHaveBeenCalledWith(10, 'LIBRE');
    expect(result.estado).toBe('CERRADA');
  });

  it('CS00004 - camino alternativo donde count > 0', async () => {

    // Arrange
    const reservaMock = {
      id: 2,
      estado: 'ABIERTA',
      celda: { id: 20 },
    };

    jest.spyOn(service, 'findReservaById').mockResolvedValue(reservaMock as any);

    reservaRepository.save.mockResolvedValue({
      ...reservaMock,
      estado: 'CERRADA',
    });

    reservaRepository.count.mockResolvedValue(1);

    // Act
    const result = await service.finalizarReserva(2);

    // Assert
    expect(celdasService.actualizarEstado).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

});

});