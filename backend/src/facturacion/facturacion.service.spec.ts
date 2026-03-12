import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FacturacionService } from './facturacion.service';
import { FacturaElectronica } from './entities/factura-electronica.entity';
import { ClienteFactura } from './entities/cliente-factura.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { PagosService } from 'src/pagos/pagos.service';

describe('FacturacionService', () => {
  let service: FacturacionService;

  let facturaRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
  };

  let clienteFacturaRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
  };

  let usuarioRepository: {
    findOne: jest.Mock;
  };

  let pagosService: {
    findPagoById: jest.Mock;
  };

  beforeEach(async () => {
    facturaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    clienteFacturaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    usuarioRepository = {
      findOne: jest.fn(),
    };

    pagosService = {
      findPagoById: jest.fn(),
    };

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('1) crearCliente caminos C1-C5', () => {
    it('C1 - debe lanzar NotFound si idUsuario fue informado y no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(
        service.crearCliente({
          tipoDocumento: 'cc',
          numeroDocumento: '123',
          correo: 'a@a.com',
          idUsuario: 99,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(clienteFacturaRepository.findOne).not.toHaveBeenCalled();
    });

    it('C2 - sin idUsuario y cliente existente: actualiza correo y guarda', async () => {
      const existente = {
        id: 10,
        correo: 'viejo@correo.com',
      } as any;

      clienteFacturaRepository.findOne.mockResolvedValue(existente);
      clienteFacturaRepository.save.mockResolvedValue({
        ...existente,
        correo: 'nuevo@correo.com',
      });

      const result = await service.crearCliente({
        tipoDocumento: 'cc',
        numeroDocumento: 'abc123',
        correo: '  NUEVO@CORREO.COM ',
      });

      expect(clienteFacturaRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tipoDocumento: 'CC',
            numeroDocumento: 'ABC123',
          },
        }),
      );
      expect(clienteFacturaRepository.save).toHaveBeenCalled();
      expect(result.correo).toBe('nuevo@correo.com');
    });

    it('C3 - con idUsuario válido y cliente existente: asigna usuario y guarda', async () => {
      const usuario = { id: 7 } as any;
      const existente = {
        id: 15,
        correo: 'old@x.com',
        usuario: null,
      } as any;

      usuarioRepository.findOne.mockResolvedValue(usuario);
      clienteFacturaRepository.findOne.mockResolvedValue(existente);
      clienteFacturaRepository.save.mockResolvedValue({
        ...existente,
        correo: 'nuevo@x.com',
        usuario,
      });

      const result = await service.crearCliente({
        tipoDocumento: 'ti',
        numeroDocumento: '900',
        correo: 'nuevo@x.com',
        idUsuario: 7,
      });

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
      expect(clienteFacturaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ usuario }),
      );
      expect(result.usuario).toEqual(usuario);
    });

    it('C4 - sin idUsuario y cliente inexistente: crea y guarda nuevo cliente', async () => {
      const creado = {
        tipoDocumento: 'CC',
        numeroDocumento: '777',
        correo: 'n@x.com',
      } as any;

      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue(creado);
      clienteFacturaRepository.save.mockResolvedValue({ id: 21, ...creado });

      const result = await service.crearCliente({
        tipoDocumento: 'cc',
        numeroDocumento: '777',
        correo: 'N@X.COM',
      });

      expect(clienteFacturaRepository.create).toHaveBeenCalled();
      expect(clienteFacturaRepository.save).toHaveBeenCalledWith(creado);
      expect(result.id).toBe(21);
    });

    it('C5 - con idUsuario válido y cliente inexistente: crea y guarda con usuario', async () => {
      const usuario = { id: 3 } as any;
      const creado = {
        tipoDocumento: 'CC',
        numeroDocumento: '888',
        correo: 'ok@x.com',
        usuario,
      } as any;

      usuarioRepository.findOne.mockResolvedValue(usuario);
      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue(creado);
      clienteFacturaRepository.save.mockResolvedValue({ id: 22, ...creado });

      const result = await service.crearCliente({
        tipoDocumento: 'cc',
        numeroDocumento: '888',
        correo: 'ok@x.com',
        idUsuario: 3,
      });

      expect(clienteFacturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario }),
      );
      expect(result.id).toBe(22);
    });
  });

  describe('2) obtenerClientes camino C1', () => {
    it('C1 - debe consultar y retornar clientes', async () => {
      const data = [{ id: 1 }, { id: 2 }] as any;
      clienteFacturaRepository.find.mockResolvedValue(data);

      const result = await service.obtenerClientes();

      expect(clienteFacturaRepository.find).toHaveBeenCalledWith({
        relations: ['usuario'],
      });
      expect(result).toEqual(data);
    });
  });

  describe('3) crearFactura caminos C1-C3', () => {
    it('C1 - debe propagar NotFound cuando no existe pago', async () => {
      pagosService.findPagoById.mockRejectedValue(
        new NotFoundException('No existe pago'),
      );

      await expect(service.crearFactura({ idPago: 404 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('C2 - con cliente resuelto: guarda factura con cliente', async () => {
      const pago = { id: 10, reserva: null } as any;
      const cliente = { id: 55 } as any;
      const facturaCreada = {
        pago,
        clienteFactura: cliente,
      } as any;

      pagosService.findPagoById.mockResolvedValue(pago);
      clienteFacturaRepository.findOne.mockResolvedValue(cliente);
      facturaRepository.create.mockReturnValue(facturaCreada);
      facturaRepository.save.mockResolvedValue({ id: 1, ...facturaCreada });

      const result = await service.crearFactura({
        idPago: 10,
        idClienteFactura: 55,
      });

      expect(facturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pago,
          clienteFactura: cliente,
          enviada: 'Y',
        }),
      );
      expect(result.tipoFactura).toBe('NORMAL');
    });

    it('C3 - sin cliente resuelto: guarda factura con cliente null', async () => {
      const pago = { id: 11, reserva: null } as any;
      const facturaCreada = { pago, clienteFactura: null } as any;

      pagosService.findPagoById.mockResolvedValue(pago);
      facturaRepository.create.mockReturnValue(facturaCreada);
      facturaRepository.save.mockResolvedValue({ id: 2, ...facturaCreada });

      const result = await service.crearFactura({ idPago: 11 });

      expect(facturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ clienteFactura: null }),
      );
      expect(result.id).toBe(2);
    });
  });

  describe('4) findByPago caminos C1-C2', () => {
    it('C1 - retorna null cuando no hay factura para el pago', async () => {
      facturaRepository.findOne.mockResolvedValue(null);

      const result = await service.findByPago(999);

      expect(result).toBeNull();
    });

    it('C2 - retorna factura transformada cuando existe', async () => {
      facturaRepository.findOne.mockResolvedValue({
        id: 3,
        cufe: 'FAC-3-1',
        enviada: 'Y',
      } as any);

      const result = await service.findByPago(3);

      expect(result).toEqual(
        expect.objectContaining({
          id: 3,
          tipoFactura: 'NORMAL',
          cufe: null,
          enviada: false,
        }),
      );
    });
  });

  describe('5) findMisFacturas caminos C2-C4 (solo por idUsuario)', () => {
    it('C2 - múltiples clienteFactura por usuario => BadRequest', async () => {
      clienteFacturaRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await expect(service.findMisFacturas(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('C3 - un clienteFactura por usuario => retorna sus facturas', async () => {
      clienteFacturaRepository.find.mockResolvedValue([{ id: 5 }]);
      facturaRepository.find.mockResolvedValue([{ id: 91 }, { id: 90 }]);

      const result = await service.findMisFacturas(5);

      expect(facturaRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteFactura: { id: 5 } },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('C4 - sin cliente por usuario => retorna lista vacía', async () => {
      clienteFacturaRepository.find.mockResolvedValue([]);

      const result = await service.findMisFacturas(8);

      expect(result).toEqual([]);
    });
  });
});
