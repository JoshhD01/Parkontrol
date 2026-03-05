import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PagosService } from './pagos.service';
import { Pago } from './entities/pago.entity';
import { MetodoPago } from 'src/shared/entities/metodo-pago.entity';
import { ReservasService } from 'src/reservas/reservas.service';
import { TarifasService } from 'src/tarifas/tarifas.service';

describe('PagosService', () => {
  let service: PagosService; 

  //Se crean mocks para los repositorios y servicios que el PagosService utiliza.
  let pagoRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  let metodoPagoRepo: {
    findOne: jest.Mock;
  };

  let reservasService: {
    findReservaById: jest.Mock;
    finalizarReserva: jest.Mock;
  };

  let tarifasService: {
    findByParqueaderoYTipo: jest.Mock;
  };

  // Antes de cada prueba, se inicializan los mocks y se crea una instancia del servicio.
  beforeEach(async () => {
    pagoRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    metodoPagoRepo = {
      findOne: jest.fn(),
    };

    reservasService = {
      findReservaById: jest.fn(),
      finalizarReserva: jest.fn(),
    };

    tarifasService = {
      findByParqueaderoYTipo: jest.fn(),
    };

    // Se crea un módulo de prueba que proporciona el servicio y los mocks necesarios.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(Pago),
          useValue: pagoRepo,
        },
        {
          provide: getRepositoryToken(MetodoPago),
          useValue: metodoPagoRepo,
        },
        {
          provide: ReservasService,
          useValue: reservasService,
        },
        {
          provide: TarifasService,
          useValue: tarifasService,
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =====================================================
  // PRUEBAS DEL MÉTODO crear (Procesar pago) 
  // =====================================================

  describe('crear', () => {
    const dto = {
      idReserva: 1,
      idMetodoPago: 1,
    };

    const mockMetodoPago = {
      id: 1,
      nombre: 'Efectivo',
    };

    const mockTarifa = {
      id: 1,
      precioFraccionHora: 5000,
      precioHoraAdicional: 4000,
    };

    const mockReserva = {
      id: 1,
      estado: 'ABIERTA',
      fechaEntrada: new Date('2024-01-15T10:00:00'),
      fechaSalida: new Date('2024-01-15T14:30:00'),
      celda: { id: 1, parqueadero: { id: 1 } },
      vehiculo: { id: 1, tipoVehiculo: { id: 1 } },
    };

    const mockPago = {
      id: 1,
      monto: 21000,
      fechaPago: new Date(),
      reserva: mockReserva,
      metodoPago: mockMetodoPago,
    };

    it('CP00001 - Debe crear un pago exitosamente cuando todos los datos son válidos', async () => {

      // Se configuran los mocks para simular el comportamiento esperado de los servicios y repositorios.
      reservasService.findReservaById.mockResolvedValue(mockReserva);
      reservasService.finalizarReserva.mockResolvedValue({
        ...mockReserva,
        fechaSalida: new Date('2024-01-15T14:30:00'),
      });
      pagoRepo.findOne.mockResolvedValue(null);//No existe un pago previo para la reserva
      metodoPagoRepo.findOne.mockResolvedValue(mockMetodoPago);
      tarifasService.findByParqueaderoYTipo.mockResolvedValue(mockTarifa);

      //Se simula el cálculo de horas y monto.
      jest.spyOn(service as any, 'calcularHoras').mockReturnValue(5);
      jest.spyOn(service as any, 'calcularMonto').mockReturnValue(21000);

      //Se simula el proceso de creación y guardado del pago.
      pagoRepo.create.mockReturnValue(mockPago);
      pagoRepo.save.mockResolvedValue(mockPago);

      //Se ejecuta el método a probar.
      const resultado = await service.crear(dto);

        //Se verifican que los mocks hayan sido llamados correctamente.
      expect(reservasService.findReservaById).toHaveBeenCalledWith(1);
      expect(reservasService.finalizarReserva).toHaveBeenCalledWith(1);
      expect(pagoRepo.findOne).toHaveBeenCalled();
      expect(metodoPagoRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(tarifasService.findByParqueaderoYTipo).toHaveBeenCalledWith(1, 1);
      expect(service['calcularHoras']).toHaveBeenCalled();
      expect(service['calcularMonto']).toHaveBeenCalledWith(5, 5000, 4000);
      expect(pagoRepo.create).toHaveBeenCalled();
      expect(pagoRepo.save).toHaveBeenCalledWith(mockPago);

      //Se verifican que el resultado sea el esperado.
      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(1);
      expect(resultado.monto).toBe(21000);
    });

    it('CP00002 - Debe lanzar BadRequestException si la reserva no está en estado ABIERTA', async () => {
      
    //Verifica que el servicio de reservas devuelve una reserva con estado diferente a ABIERTA.
      const reservaCerrada = { ...mockReserva, estado: 'CERRADA' };
      reservasService.findReservaById.mockResolvedValue(reservaCerrada);

    //Se verifica que lance la excepción esperada.
      await expect(service.crear(dto)).rejects.toThrow(BadRequestException);
      await expect(service.crear(dto)).rejects.toThrow(
        'La reserva debe estar en estado ABIERTA',
      );
      
       // Verificamos que NO continuó el flujo
      expect(reservasService.findReservaById).toHaveBeenCalledWith(1);
      expect(reservasService.finalizarReserva).not.toHaveBeenCalled();
      expect(pagoRepo.save).not.toHaveBeenCalled();
    });

    it('CP00003 - Debe lanzar BadRequestException si la reserva no tiene fecha de salida', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      reservasService.findReservaById.mockResolvedValue(mockReserva);
      reservasService.finalizarReserva.mockResolvedValue({
        ...mockReserva,
        fechaSalida: null,
      });

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.crear(dto)).rejects.toThrow(BadRequestException);
      await expect(service.crear(dto)).rejects.toThrow(
        'La reserva debe estar finalizada',
      );

      expect(reservasService.finalizarReserva).toHaveBeenCalledWith(1);
      expect(pagoRepo.save).not.toHaveBeenCalled();
    });

    it('CP00004 - Debe lanzar BadRequestException si ya existe un pago para la reserva', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      reservasService.findReservaById.mockResolvedValue(mockReserva);
      reservasService.finalizarReserva.mockResolvedValue({
        ...mockReserva,
        fechaSalida: new Date(),
      });
      pagoRepo.findOne.mockResolvedValue(mockPago);

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.crear(dto)).rejects.toThrow(BadRequestException);
      await expect(service.crear(dto)).rejects.toThrow(
        'Ya existe un pago registrado para esta reserva',
      );

      expect(pagoRepo.findOne).toHaveBeenCalled();
      expect(metodoPagoRepo.findOne).not.toHaveBeenCalled();
      expect(pagoRepo.save).not.toHaveBeenCalled();
    });

    it('CP00005 - Debe lanzar NotFoundException si el método de pago no existe', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      reservasService.findReservaById.mockResolvedValue(mockReserva);
      reservasService.finalizarReserva.mockResolvedValue({
        ...mockReserva,
        fechaSalida: new Date(),
      });
      pagoRepo.findOne.mockResolvedValue(null);
      metodoPagoRepo.findOne.mockResolvedValue(null);

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.crear(dto)).rejects.toThrow(NotFoundException);
      await expect(service.crear(dto)).rejects.toThrow(
        'No existe método de pago con id: 1',
      );

      expect(metodoPagoRepo.findOne).toHaveBeenCalled();
      expect(tarifasService.findByParqueaderoYTipo).not.toHaveBeenCalled();
      expect(pagoRepo.save).not.toHaveBeenCalled();
    });

    it('CP00006 - Debe lanzar NotFoundException si no existe tarifa configurada', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      reservasService.findReservaById.mockResolvedValue(mockReserva);
      reservasService.finalizarReserva.mockResolvedValue({
        ...mockReserva,
        fechaSalida: new Date(),
      });
      pagoRepo.findOne.mockResolvedValue(null);
      metodoPagoRepo.findOne.mockResolvedValue(mockMetodoPago);
      tarifasService.findByParqueaderoYTipo.mockResolvedValue(null);

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.crear(dto)).rejects.toThrow(NotFoundException);
      await expect(service.crear(dto)).rejects.toThrow(
        'No existe tarifa configurada',
      );

      expect(tarifasService.findByParqueaderoYTipo).toHaveBeenCalled();
      expect(pagoRepo.save).not.toHaveBeenCalled();
    });

    it('CP00007 - Debe lanzar error si findReservaById falla', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      reservasService.findReservaById.mockRejectedValue(new Error('Error DB'));

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.crear(dto)).rejects.toThrow('Error DB');
      expect(reservasService.finalizarReserva).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // PRUEBAS DEL MÉTODO calcularHoras (privado)
  // =====================================================

  describe('calcularHoras', () => {
    it('CP00008 - Debe calcular horas exactas correctamente', () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      const entrada = new Date('2024-01-15T10:00:00');
      const salida = new Date('2024-01-15T14:00:00');

      // -------------------------
      // ACT
      // -------------------------

      const resultado = (service as any).calcularHoras(entrada, salida);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado).toBe(4);
    });

    it('CP00009 - Debe redondear hacia arriba las fracciones de hora', () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      const entrada = new Date('2024-01-15T10:00:00');
      const salida = new Date('2024-01-15T14:30:00');

      // -------------------------
      // ACT
      // -------------------------

      const resultado = (service as any).calcularHoras(entrada, salida);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado).toBe(5); // 4.5 horas -> 5
    });

    it('CP00010 - Debe calcular correctamente períodos de menos de 1 hora', () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      const entrada = new Date('2024-01-15T10:00:00');
      const salida = new Date('2024-01-15T10:45:00');

      // -------------------------
      // ACT
      // -------------------------

      const resultado = (service as any).calcularHoras(entrada, salida);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado).toBe(1); // 0.75 horas -> 1
    });

    it('CP00011 - Debe calcular correctamente períodos de múltiples días', () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      const entrada = new Date('2024-01-15T10:00:00');
      const salida = new Date('2024-01-17T15:30:00');

      // -------------------------
      // ACT
      // -------------------------

      const resultado = (service as any).calcularHoras(entrada, salida);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado).toBe(54); // 53.5 horas -> 54
    });
  });

  // =====================================================
  // PRUEBAS DEL MÉTODO calcularMonto (privado)
  // =====================================================

  describe('calcularMonto', () => {
    const precioFraccion = 5000;
    const precioHoraAdicional = 4000;

    it('CP00012 - Debe cobrar solo fracción para 1 hora o menos', () => {
      // -------------------------
      // ACT
      // -------------------------

      const resultado1 = (service as any).calcularMonto(1, precioFraccion, precioHoraAdicional);
      const resultado2 = (service as any).calcularMonto(0.5, precioFraccion, precioHoraAdicional);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado1).toBe(5000);
      expect(resultado2).toBe(5000);
    });

    it('CP00013 - Debe calcular correctamente horas adicionales con precio adicional', () => {
      // -------------------------
      // ACT
      // -------------------------

      const resultado = (service as any).calcularMonto(3, precioFraccion, precioHoraAdicional);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado).toBe(5000 + (2 * 4000)); // 13000
    });

    it('CP00014 - Debe usar precio fracción como adicional si no se especifica precio adicional', () => {
      // -------------------------
      // ACT
      // -------------------------

      const resultado = (service as any).calcularMonto(3, precioFraccion);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado).toBe(5000 + (2 * 5000)); // 15000
    });

    it('CP00015 - Debe calcular correctamente con valores límite', () => {
      // -------------------------
      // ACT
      // -------------------------

      const resultado1 = (service as any).calcularMonto(2, 1000, 800);
      const resultado2 = (service as any).calcularMonto(1.1, 1000, 800);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado1).toBe(1800); // 1000 + 800
      expect(resultado2).toBe(1800); // 1.1 horas = 2 horas totales
    });
  });

  // =====================================================
  // PRUEBAS DEL MÉTODO findPagoById
  // =====================================================

  describe('findPagoById', () => {
    const mockPago = {
      id: 1,
      monto: 5000,
      fechaPago: new Date(),
      reserva: { id: 1 },
      metodoPago: { id: 1, nombre: 'Efectivo' },
    };

    it('CP00016 - Debe encontrar un pago por ID cuando existe', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      pagoRepo.findOne.mockResolvedValue(mockPago);

      // -------------------------
      // ACT
      // -------------------------

      const resultado = await service.findPagoById(1);

      // -------------------------
      // ASSERT
      // -------------------------

      expect(pagoRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'reserva',
          'reserva.vehiculo',
          'reserva.celda',
          'reserva.clienteFactura',
          'metodoPago',
        ],
      });
      expect(resultado).toBeDefined();
      expect(resultado.id).toBe(1);
    });

    it('CP00017 - Debe lanzar NotFoundException si el pago no existe', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      pagoRepo.findOne.mockResolvedValue(null);

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.findPagoById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findPagoById(999)).rejects.toThrow(
        'No existe pago con id: 999',
      );
    });

    it('CP00018 - Debe propagar error si la consulta falla', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      pagoRepo.findOne.mockRejectedValue(new Error('Error de base de datos'));

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.findPagoById(1)).rejects.toThrow('Error de base de datos');
    });
  });

  // =====================================================
  // PRUEBAS DEL MÉTODO findByCliente
  // =====================================================

  describe('findByCliente', () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    const mockPagos = [
      {
        id: 1,
        monto: 5000,
        fechaPago: new Date(),
        reserva: { id: 1, clienteFactura: { id: 1, correo: 'test@test.com' } },
        metodoPago: { id: 1, nombre: 'Efectivo' },
      },
      {
        id: 2,
        monto: 8000,
        fechaPago: new Date(),
        reserva: { id: 2, clienteFactura: { id: 1, correo: 'test@test.com' } },
        metodoPago: { id: 2, nombre: 'Tarjeta' },
      },
    ];

    it('CP00019 - Debe encontrar pagos por ID de cliente y correo', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockPagos);

      // -------------------------
      // ACT
      // -------------------------

      const resultado = await service.findByCliente(1, 'test@test.com');

      // -------------------------
      // ASSERT
      // -------------------------

      expect(pagoRepo.createQueryBuilder).toHaveBeenCalledWith('pago');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(5);
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('reserva.clienteFactura', 'clienteFactura');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'clienteFactura.ID_CLIENTE_FACTURA = :idClienteFactura',
        { idClienteFactura: 1 },
      );
      expect(mockQueryBuilder.orWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('pago.FECHA_PAGO', 'DESC');
      expect(resultado).toHaveLength(2);
      expect(resultado[0].id).toBe(1);
      expect(resultado[1].id).toBe(2);
    });

    it('CP00020 - Debe normalizar el correo (trim y lowercase) para la búsqueda', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockPagos);

      // -------------------------
      // ACT
      // -------------------------

      await service.findByCliente(1, '  TEST@TEST.COM  ');

      // -------------------------
      // ASSERT
      // -------------------------

      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
        "LOWER(TRIM(clienteFactura.CORREO)) = LOWER(TRIM(:correoNormalizado))",
        { correoNormalizado: 'test@test.com' },
      );
    });

    it('CP00021 - Debe retornar array vacío si no hay pagos para el usuario', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // -------------------------
      // ACT
      // -------------------------

      const resultado = await service.findByCliente(999, 'noexiste@test.com');

      // -------------------------
      // ASSERT
      // -------------------------

      expect(resultado).toEqual([]);
      expect(resultado.length).toBe(0);
    });

    it('CP00022 - Debe propagar error si la consulta falla', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockRejectedValue(new Error('Error en consulta'));

      // -------------------------
      // ACT + ASSERT
      // -------------------------

      await expect(service.findByCliente(1, 'test@test.com')).rejects.toThrow('Error en consulta');
    });

    it('CP00023 - Debe crear el queryBuilder con la estructura correcta', async () => {
      // -------------------------
      // ARRANGE
      // -------------------------

      const leftJoinAndSelectMock = jest.fn().mockReturnThis();
      const leftJoinMock = jest.fn().mockReturnThis();
      const whereMock = jest.fn().mockReturnThis();
      const orWhereMock = jest.fn().mockReturnThis();
      const orderByMock = jest.fn().mockReturnThis();
      const getManyMock = jest.fn().mockResolvedValue([]);

      const customQueryBuilder = {
        leftJoinAndSelect: leftJoinAndSelectMock,
        leftJoin: leftJoinMock,
        where: whereMock,
        orWhere: orWhereMock,
        orderBy: orderByMock,
        getMany: getManyMock,
      };

      pagoRepo.createQueryBuilder.mockReturnValue(customQueryBuilder);

      // -------------------------
      // ACT
      // -------------------------

      await service.findByCliente(1, 'test@test.com');

      // -------------------------
      // ASSERT
      // -------------------------

      expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(1, 'pago.reserva', 'reserva');
      expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(2, 'reserva.vehiculo', 'vehiculo');
      expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(3, 'vehiculo.tipoVehiculo', 'tipoVehiculo');
      expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(4, 'reserva.celda', 'celda');
      expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(5, 'celda.parqueadero', 'parqueadero');
      expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(6, 'pago.metodoPago', 'metodoPago');
      expect(leftJoinMock).toHaveBeenCalledWith('reserva.clienteFactura', 'clienteFactura');
      expect(orderByMock).toHaveBeenCalledWith('pago.FECHA_PAGO', 'DESC');
    });
  });
});