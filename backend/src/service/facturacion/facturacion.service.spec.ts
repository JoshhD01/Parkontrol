import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FacturacionService } from './facturacion.service';
import { FacturaElectronica } from 'src/entities/facturacion/entities/factura-electronica.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { Usuario } from 'src/entities/usuarios/entities/usuario.entity';
import { PagosService } from 'src/service/pagos/pagos.service';



type FacturaRepositoryDouble = {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  find: jest.Mock;
  createQueryBuilder?: jest.Mock;
};

type ClienteFacturaRepositoryDouble = {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  find: jest.Mock;
};

type UsuarioRepositoryDouble = {
  findOne: jest.Mock;
};

type PagosServiceDouble = {
  findPagoById: jest.Mock;
};

const buildCrudRepositoryMock = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('FacturacionService', () => {
  let service: FacturacionService;
  let facturaRepository: FacturaRepositoryDouble;
  let clienteFacturaRepository: ClienteFacturaRepositoryDouble;
  let usuarioRepository: UsuarioRepositoryDouble;
  let pagosService: PagosServiceDouble;

  // Builder Pattern para crear test doubles consistentes
  const buildFacturaRepoMock = (): FacturaRepositoryDouble => ({
    ...buildCrudRepositoryMock(),
  });

  const buildClienteRepoMock = (): ClienteFacturaRepositoryDouble => ({
    ...buildCrudRepositoryMock(),
  });

  const buildUsuarioRepoMock = (): UsuarioRepositoryDouble => ({
    findOne: jest.fn(),
  });

  const buildPagosServiceMock = (): PagosServiceDouble => ({
    findPagoById: jest.fn(),
  });

  // Setup: Independencia entre tests - cada uno obtiene sus propios mocks
  beforeEach(async () => {
    facturaRepository = buildFacturaRepoMock();
    clienteFacturaRepository = buildClienteRepoMock();
    usuarioRepository = buildUsuarioRepoMock();
    pagosService = buildPagosServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturacionService,
        {
          provide: getRepositoryToken(FacturaElectronica),
          useValue: facturaRepository,
        },
        {
          provide: getRepositoryToken(ClienteFactura),
          useValue: clienteFacturaRepository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
        {
          provide: PagosService,
          useValue: pagosService,
        },
      ],
    }).compile();

    service = module.get<FacturacionService>(FacturacionService);
  });

  // Limpieza: Asegurar que test anterior no afecte al siguiente
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearCliente', () => {
    // Arrange: Datos comunes para tests de crearCliente
    const createClienteDtoTemplate = {
      tipoDocumento: 'cc',
      numeroDocumento: '1234567890',
      correo: 'cliente@example.com',
      idUsuario: undefined,
    };

    it('[FAST] C1 debe lanzar NotFoundException si idUsuario fue informado y no existe', async () => {
      // Arrange
      const dto = { ...createClienteDtoTemplate, idUsuario: 99 };
      usuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert (Negativo)
      await expect(service.crearCliente(dto)).rejects.toThrow(NotFoundException);

      // Assert: Verificar que no intenta buscar cliente si usuario no existe
      expect(clienteFacturaRepository.findOne).not.toHaveBeenCalled();
      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 99 },
      });
    });

    it('[INDEPENDENT] C2 sin idUsuario y cliente no existente crea cliente nuevo', async () => {
      // Arrange
      const dto = { ...createClienteDtoTemplate, idUsuario: undefined };
      const clienteNuevo = {
        id: 20,
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        correo: 'cliente@example.com',
      } as any;

      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue(clienteNuevo);
      clienteFacturaRepository.save.mockResolvedValue(clienteNuevo);

      // Act
      const result = await service.crearCliente(dto);

      // Assert
      expect(clienteFacturaRepository.create).toHaveBeenCalledWith({
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        correo: 'cliente@example.com',
        usuario: undefined,
      });
      expect(clienteFacturaRepository.save).toHaveBeenCalledWith(clienteNuevo);
      expect(result.id).toBe(20);
    });

    it('[REPEATABLE] C3 con cliente existente actualiza correo y usuario', async () => {
      // Arrange
      const usuarioExistente = { id: 5 } as any;
      const clienteExistente = {
        id: 10,
        tipoDocumento: 'CC',
        numeroDocumento: 'ABC123',
        correo: 'viejo@correo.com',
        usuario: null,
      } as any;

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: 'abc123',
        correo: '  NUEVO@CORREO.COM ',
        idUsuario: 5,
      };

      usuarioRepository.findOne.mockResolvedValue(usuarioExistente);
      clienteFacturaRepository.findOne.mockResolvedValue(clienteExistente);
      clienteFacturaRepository.save.mockResolvedValue({
        ...clienteExistente,
        correo: 'nuevo@correo.com',
        usuario: usuarioExistente,
      });

      // Act
      const result = await service.crearCliente(dto);

      // Assert
      expect(clienteFacturaRepository.findOne).toHaveBeenCalledWith({
        where: {
          tipoDocumento: 'CC',
          numeroDocumento: 'ABC123',
        },
        relations: ['usuario'],
      });
      expect(clienteFacturaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          correo: 'nuevo@correo.com',
          usuario: usuarioExistente,
        }),
      );
      expect(result.correo).toBe('nuevo@correo.com');
    });

    it('[SELF-CHECKING] C4 normaliza tipoDocumento y numeroDocumento a mayúsculas', async () => {
      // Arrange
      const dto = {
        tipoDocumento: '  cC  ',
        numeroDocumento: '  abc123  ',
        correo: 'test@test.com',
      };

      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue({} as any);
      clienteFacturaRepository.save.mockResolvedValue({} as any);

      // Act
      await service.crearCliente(dto);

      // Assert
      expect(clienteFacturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoDocumento: 'CC',
          numeroDocumento: 'ABC123',
        }),
      );
    });

    it('[TIMELY] C5 normaliza correo a minúsculas', async () => {
      // Arrange
      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123',
        correo: 'CLIENTE@EXAMPLE.COM',
      };

      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue({} as any);
      clienteFacturaRepository.save.mockResolvedValue({} as any);

      // Act
      await service.crearCliente(dto);

      // Assert
      expect(clienteFacturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          correo: 'cliente@example.com',
        }),
      );
    });
  });

  describe('crearFactura', () => {
    it('[FAST] F1 crea factura exitosamente con cliente informado', async () => {
      // Arrange
      const pagoStub = { id: 1, reserva: null } as any;
      const clienteStub = { id: 15 } as any;
      const dto = { idPago: 1, idClienteFactura: 15 };

      const facturaCreada = {
        id: 100,
        pago: pagoStub,
        clienteFactura: clienteStub,
        cufe: expect.stringContaining('NF-'),
        enviada: 'Y',
        fechaCreacion: expect.any(Date),
      } as any;

      pagosService.findPagoById.mockResolvedValue(pagoStub);
      clienteFacturaRepository.findOne.mockResolvedValue(clienteStub);
      facturaRepository.create.mockReturnValue(facturaCreada);
      facturaRepository.save.mockResolvedValue(facturaCreada);

      // Act
      const result = await service.crearFactura(dto);

      // Assert
      expect(pagosService.findPagoById).toHaveBeenCalledWith(1);
      expect(clienteFacturaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 15 },
      });
      expect(facturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pago: pagoStub,
          clienteFactura: clienteStub,
          enviada: 'Y',
        }),
      );
      expect(result).toBeDefined();
    });

    it('[INDEPENDENT] F2 genera código CUFE único por pago', async () => {
      // Arrange
      const pagoStub = { id: 555, reserva: null } as any;
      const dto = { idPago: 555 };

      pagosService.findPagoById.mockResolvedValue(pagoStub);
      clienteFacturaRepository.findOne.mockResolvedValue(null);
      facturaRepository.create.mockReturnValue({} as any);
      facturaRepository.save.mockResolvedValue({} as any);

      // Act
      await service.crearFactura(dto);

      // Assert
      expect(facturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cufe: expect.stringMatching(/^NF-555-\d+$/),
        }),
      );
    });
  });

  describe('findByPago', () => {
    it('[REPEATABLE] FP1 retorna factura cuando existe', async () => {
      // Arrange
      const facturaStub = {
        id: 50,
        pago: { id: 10 },
        clienteFactura: { id: 5 },
        enviada: 'Y',
      } as any;

      facturaRepository.findOne.mockResolvedValue(facturaStub);

      // Act
      const result = (await service.findByPago(10)) as { id: number };

      // Assert
      expect(facturaRepository.findOne).toHaveBeenCalledWith({
        where: { pago: { id: 10 } },
        relations: ['pago', 'clienteFactura'],
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(50);
    });

    it('[SELF-CHECKING] FP2 retorna null cuando factura no existe', async () => {
      // Arrange
      facturaRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByPago(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByClienteFactura', () => {
    it('[FAST] FC1 retorna lista de facturas ordenadas por fecha DESC', async () => {
      // Arrange
      const facturasStub = [
        { id: 1, fechaCreacion: new Date('2024-01-15') },
        { id: 2, fechaCreacion: new Date('2024-01-10') },
      ] as any[];

      facturaRepository.find.mockResolvedValue(facturasStub);

      // Act
      const result = await service.findByClienteFactura(5);

      // Assert
      expect(facturaRepository.find).toHaveBeenCalledWith({
        where: { clienteFactura: { id: 5 } },
        relations: ['pago', 'pago.metodoPago', 'clienteFactura'],
        order: { fechaCreacion: 'DESC' },
      });
      expect(result.length).toBe(2);
    });
  });

  describe('findMisFacturas', () => {
    const buildFacturaQueryBuilderMock = (rows: any[]) => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(rows),
      };

      facturaRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
      return queryBuilder;
    };

    it('[INDEPENDENT] FM1 retorna array vacío cuando no hay coincidencias por usuario ni correo', async () => {
      // Arrange
      const queryBuilder = buildFacturaQueryBuilderMock([]);

      // Act
      const result = await service.findMisFacturas(1, 'cliente@x.com');

      // Assert
      expect(result).toEqual([]);
      expect(facturaRepository.createQueryBuilder).toHaveBeenCalledWith('factura');
      expect(queryBuilder.where).toHaveBeenCalledWith('usuarioFactura.id = :idUsuario', {
        idUsuario: 1,
      });
    });

    it('[SELF-CHECKING] FM2 retorna facturas cuando existe coincidencia por correo', async () => {
      // Arrange
      const facturasStub = [
        { id: 100, cufe: 'NF-1-1', enviada: 'Y' },
      ] as any[];
      const queryBuilder = buildFacturaQueryBuilderMock(facturasStub);

      // Act
      const result = await service.findMisFacturas(1, 'CLIENTE@X.COM');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 100,
          tipoFactura: 'NORMAL',
          cufe: null,
          enviada: false,
        }),
      );
      expect(queryBuilder.orWhere).toHaveBeenCalledWith(
        'LOWER(TRIM(clienteFacturaFactura.CORREO)) = LOWER(TRIM(:correoNormalizado))',
        { correoNormalizado: 'cliente@x.com' },
      );
    });
  });

  describe('obtenerClientes', () => {
    it('[TIMELY] OC1 retorna lista de todos los clientes con relación usuario', async () => {
      // Arrange
      const clientesStub = [
        { id: 1, nombre: 'Cliente 1' },
        { id: 2, nombre: 'Cliente 2' },
      ] as any[];

      clienteFacturaRepository.find.mockResolvedValue(clientesStub);

      // Act
      const result = await service.obtenerClientes();

      // Assert
      expect(clienteFacturaRepository.find).toHaveBeenCalledWith({
        relations: ['usuario'],
      });
      expect(result).toEqual(clientesStub);
    });
  });
});

