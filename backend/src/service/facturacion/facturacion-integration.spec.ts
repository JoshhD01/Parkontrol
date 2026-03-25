import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FacturacionService } from './facturacion.service';
import { FacturacionController } from 'src/controller/facturacion/facturacion.controller';
import { FacturaElectronica } from 'src/entities/facturacion/entities/factura-electronica.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { Usuario } from 'src/entities/usuarios/entities/usuario.entity';
import { PagosService } from '../pagos/pagos.service';

/**
 * Tests de Integración para Facturacion
 * Escenarios más realistas que combinan Service + Controller
 * AAA Pattern: Arrange, Act, Assert
 */

describe('Facturacion Integration Tests', () => {
  let service: FacturacionService;
  let controller: FacturacionController;
  let facturaRepository: any;
  let clienteFacturaRepository: any;
  let usuarioRepository: any;
  let pagosService: any;

  beforeEach(async () => {
    // Arrange: Crear mocks para todas las dependencias
    const facturaRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const clienteRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const usuarioRepoMock = {
      findOne: jest.fn(),
    };

    const pagosServiceMock = {
      findPagoById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturacionController],
      providers: [
        FacturacionService,
        {
          provide: getRepositoryToken(FacturaElectronica),
          useValue: facturaRepoMock,
        },
        {
          provide: getRepositoryToken(ClienteFactura),
          useValue: clienteRepoMock,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepoMock,
        },
        {
          provide: PagosService,
          useValue: pagosServiceMock,
        },
      ],
    }).compile();

    service = module.get<FacturacionService>(FacturacionService);
    controller = module.get<FacturacionController>(FacturacionController);
    facturaRepository = facturaRepoMock;
    clienteFacturaRepository = clienteRepoMock;
    usuarioRepository = usuarioRepoMock;
    pagosService = pagosServiceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Escenario Buscar factura por pago inexistente
   * El controlador debe lanzar NotFoundException
   */
  describe('Scenario: Buscar factura por pago inexistente', () => {
    it('[AAA] debe lanzar NotFoundException cuando pago no tiene factura', async () => {
      // Arrange
      const pagoId = 999;
      facturaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.obtenerPorPago(pagoId)).rejects.toThrow(NotFoundException);
      
      // Verificar que se buscó correctamente
      expect(facturaRepository.findOne).toHaveBeenCalledWith({
        where: { pago: { id: pagoId } },
        relations: ['pago', 'clienteFactura'],
      });
    });
  });

  /**
   * Escenario: Cliente CLIENTE obtiene sus facturas
   * Flujo completo del controlador + servicio
   */
  describe('Scenario: Cliente obtiene sus facturas', () => {
    it('[AAA] cliente valido obtiene sus facturas correctamente', async () => {
      // Arrange
      const usuarioId = 5;
      const clienteId = 25;
      const clienteStub = { id: clienteId, usuario: { id: usuarioId } };
      const facturasStub = [
        { id: 100, clienteFactura: clienteStub },
        { id: 101, clienteFactura: clienteStub },
      ];

      clienteFacturaRepository.find.mockResolvedValue([clienteStub]);
      facturaRepository.find.mockResolvedValue(facturasStub);

      const userPayload = {
        id: usuarioId,
        nombreRol: 'CLIENTE',
        correo: 'cliente@test.com',
      } as any;

      // Act
      const result = await controller.obtenerFacturasCliente(userPayload);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 100 }),
        expect.objectContaining({ id: 101 }),
      ]));
    });
  });

  /**
   * Escenario: Crear cliente y luego factura
   * Flujo realista de dos operaciones consecutivas
   */
  describe('Scenario: Crear cliente y factura en secuencia', () => {
    it('[INDEPENDENT] debe crear cliente y después crear factura', async () => {
      // Arrange - Crear Cliente
      const clienteDto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123456789',
        correo: 'nuevo@example.com',
      };

      const clienteCreado = {
        id: 50,
        tipoDocumento: 'CC',
        numeroDocumento: '123456789',
        correo: 'nuevo@example.com',
      };

      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue(clienteCreado);
      clienteFacturaRepository.save.mockResolvedValue(clienteCreado);

      // Act - Crear cliente
      const cliente = await service.crearCliente(clienteDto);

      // Assert - Verificar cliente creado
      expect(cliente.id).toBe(50);

      // Arrange - Ahora crear factura para ese cliente
      const pagoStub = { id: 10, reserva: null };
      const facturaDto = { idPago: 10, idClienteFactura: 50 };

      clienteFacturaRepository.findOne.mockResolvedValue(clienteCreado);
      pagosService.findPagoById.mockResolvedValue(pagoStub);

      const facturaCreada = {
        id: 200,
        pago: pagoStub,
        clienteFactura: clienteCreado,
        cufe: 'NF-10-1234567890',
      };

      facturaRepository.create.mockReturnValue(facturaCreada);
      facturaRepository.save.mockResolvedValue(facturaCreada);

      // Act - Crear factura
      const factura = await service.crearFactura(facturaDto);

      // Assert - Verificar factura creada con cliente correcto
      expect(factura.clienteFactura.id).toBe(50);
      expect(factura.pago.id).toBe(10);
    });
  });

  /**
   * Escenario: Validación de duplicados
   * Cliente intenta registrarse dos veces con mismo documento
   */
  describe('Scenario: Evitar duplicados de cliente', () => {
    it('[REPEATABLE] debe actualizar correo si cliente ya existe', async () => {
      // Arrange - Primera creación
      const clienteDto1 = {
        tipoDocumento: 'cc',
        numeroDocumento: '987654321',
        correo: 'email1@example.com',
      };

      const clienteExistente = {
        id: 75,
        tipoDocumento: 'CC',
        numeroDocumento: '987654321',
        correo: 'email1@example.com',
      };

      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue(clienteExistente);
      clienteFacturaRepository.save.mockResolvedValue(clienteExistente);

      // Act - Primera creación
      const primer = await service.crearCliente(clienteDto1);
      expect(primer.id).toBe(75);

      // Arrange - Segunda creación con mismo documento pero diferente email
      clienteFacturaRepository.findOne.mockResolvedValue(clienteExistente);
      const clienteActualizado = {
        ...clienteExistente,
        correo: 'email2@example.com',
      };
      clienteFacturaRepository.save.mockResolvedValue(clienteActualizado);

      const clienteDto2 = {
        tipoDocumento: 'cc',
        numeroDocumento: '987654321',
        correo: 'email2@example.com',
      };

      // Act - Segunda creación
      const segundo = await service.crearCliente(clienteDto2);

      // Assert - Debe retornar el mismo cliente pero con email actualizado
      expect(segundo.id).toBe(75); // Mismo ID
      expect(segundo.correo).toBe('email2@example.com'); // Email actualizado
      expect(clienteFacturaRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * Escenario: Obtener todas las facturas de un cliente
   * Con paginación implícita por ordenamiento DESC
   */
  describe('Scenario: Historial de facturas de cliente', () => {
    it('[FAST] debe retornar facturas ordenadas por fecha descendente', async () => {
      // Arrange
      const clienteId = 30;
      const ahora = new Date();
      const hace3Dias = new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000);
      const hace1Dia = new Date(ahora.getTime() - 1 * 24 * 60 * 60 * 1000);

      const facturasOrdenadas = [
        { id: 500, fechaCreacion: ahora, cufe: 'NF-500' },
        { id: 501, fechaCreacion: hace1Dia, cufe: 'NF-501' },
        { id: 502, fechaCreacion: hace3Dias, cufe: 'NF-502' },
      ];

      facturaRepository.find.mockResolvedValue(facturasOrdenadas);

      // Act
      const result = await service.findByClienteFactura(clienteId);

      // Assert
      expect(result).toHaveLength(3);
      // Verificar que se ordenó DESC
      expect(facturaRepository.find).toHaveBeenCalledWith({
        where: { clienteFactura: { id: clienteId } },
        relations: ['pago', 'clienteFactura'],
        order: { fechaCreacion: 'DESC' },
      });
      // Primera factura debe ser la más reciente
      expect(result[0].id).toBe(500);
      expect(result[2].id).toBe(502);
    });
  });
});
