import { NotFoundException, BadRequestException } from '@nestjs/common';
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

describe('FacturacionService', () => {
  let service: FacturacionService;
  let facturaRepository: FacturaRepositoryDouble;
  let clienteFacturaRepository: ClienteFacturaRepositoryDouble;
  let usuarioRepository: UsuarioRepositoryDouble;
  let pagosService: PagosServiceDouble;

  const buildFacturaRepoMock = (): FacturaRepositoryDouble => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  });

  const buildClienteRepoMock = (): ClienteFacturaRepositoryDouble => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  });

  const buildUsuarioRepoMock = (): UsuarioRepositoryDouble => ({
    findOne: jest.fn(),
  });

  const buildPagosServiceMock = (): PagosServiceDouble => ({
    findPagoById: jest.fn(),
  });

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearCliente', () => {
    it('C1 debe lanzar NotFound si idUsuario fue informado y no existe', async () => {
      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123',
        correo: 'a@a.com',
        idUsuario: 99,
      };

      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.crearCliente(dto)).rejects.toThrow(NotFoundException);

      expect(clienteFacturaRepository.findOne).not.toHaveBeenCalled();
    });

    it('C2 sin idUsuario y cliente existente actualiza correo y guarda', async () => {
      const clienteExistente = {
        id: 10,
        correo: 'viejo@correo.com',
      } as any;

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: 'abc123',
        correo: '  NUEVO@CORREO.COM ',
      };

      const spyGuardarCliente = jest.spyOn(clienteFacturaRepository, 'save');

      clienteFacturaRepository.findOne.mockResolvedValue(clienteExistente);
      spyGuardarCliente.mockResolvedValue({
        ...clienteExistente,
        correo: 'nuevo@correo.com',
      });

      const result = await service.crearCliente(dto);

      expect(clienteFacturaRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tipoDocumento: 'CC',
            numeroDocumento: 'ABC123',
          },
        }),
      );
      expect(spyGuardarCliente).toHaveBeenCalledTimes(1);
      expect(result.correo).toBe('nuevo@correo.com');
    });

    it('C3 con idUsuario valido y cliente existente asigna usuario y guarda', async () => {
      const usuarioStub = { id: 7 } as any;
      const clienteExistente = {
        id: 15,
        correo: 'old@x.com',
        usuario: null,
      } as any;

      const dto = {
        tipoDocumento: 'ti',
        numeroDocumento: '900',
        correo: 'nuevo@x.com',
        idUsuario: 7,
      };

      usuarioRepository.findOne.mockResolvedValue(usuarioStub);
      clienteFacturaRepository.findOne.mockResolvedValue(clienteExistente);
      clienteFacturaRepository.save.mockResolvedValue({
        ...clienteExistente,
        correo: 'nuevo@x.com',
        usuario: usuarioStub,
      });

      const result = await service.crearCliente(dto);

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
      expect(clienteFacturaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ usuario: usuarioStub }),
      );
      expect(result.usuario).toEqual(usuarioStub);
    });

    it('C4 sin idUsuario y cliente inexistente crea y guarda nuevo cliente', async () => {
      const clienteCreadoFake = {
        tipoDocumento: 'CC',
        numeroDocumento: '777',
        correo: 'n@x.com',
      } as any;

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '777',
        correo: 'N@X.COM',
      };

      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue(clienteCreadoFake);
      clienteFacturaRepository.save.mockResolvedValue({ id: 21, ...clienteCreadoFake });

      const result = await service.crearCliente(dto);

      expect(clienteFacturaRepository.create).toHaveBeenCalled();
      expect(clienteFacturaRepository.save).toHaveBeenCalledWith(clienteCreadoFake);
      expect(result.id).toBe(21);
    });

    it('C5 con idUsuario valido y cliente inexistente crea y guarda con usuario', async () => {
      const usuarioStub = { id: 3 } as any;
      const clienteCreado = {
        tipoDocumento: 'CC',
        numeroDocumento: '888',
        correo: 'ok@x.com',
        usuario: usuarioStub,
      } as any;

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '888',
        correo: 'ok@x.com',
        idUsuario: 3,
      };

      usuarioRepository.findOne.mockResolvedValue(usuarioStub);
      clienteFacturaRepository.findOne.mockResolvedValue(null);
      clienteFacturaRepository.create.mockReturnValue(clienteCreado);
      clienteFacturaRepository.save.mockResolvedValue({ id: 22, ...clienteCreado });

      const result = await service.crearCliente(dto);

      expect(clienteFacturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario: usuarioStub }),
      );
      expect(result.id).toBe(22);
    });
  });

  describe('obtenerClientes', () => {
    it('C1 consulta y retorna clientes', async () => {
      const fakeClientes = [{ id: 1 }, { id: 2 }] as any;

      clienteFacturaRepository.find.mockResolvedValue(fakeClientes);

      const result = await service.obtenerClientes();

      expect(clienteFacturaRepository.find).toHaveBeenCalledWith({
        relations: ['usuario'],
      });
      expect(result).toEqual(fakeClientes);
    });
  });

  describe('crearFactura', () => {
    it('C1 propaga NotFound cuando no existe pago', async () => {
      const dto = { idPago: 404 };

      pagosService.findPagoById.mockRejectedValue(new NotFoundException('No existe pago'));

      await expect(service.crearFactura(dto)).rejects.toThrow(NotFoundException);
    });

    it('C2 con cliente resuelto guarda factura con cliente', async () => {
      const pagoStub = { id: 10, reserva: null } as any;
      const clienteStub = { id: 55 } as any;
      const facturaCreadaDummy = {
        pago: pagoStub,
        clienteFactura: clienteStub,
      } as any;

      const dto = {
        idPago: 10,
        idClienteFactura: 55,
      };

      pagosService.findPagoById.mockResolvedValue(pagoStub);
      clienteFacturaRepository.findOne.mockResolvedValue(clienteStub);
      facturaRepository.create.mockReturnValue(facturaCreadaDummy);
      facturaRepository.save.mockResolvedValue({ id: 1, ...facturaCreadaDummy });

      const result = await service.crearFactura(dto);

      expect(facturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pago: pagoStub,
          clienteFactura: clienteStub,
          enviada: 'Y',
        }),
      );
      expect(result.tipoFactura).toBe('NORMAL');
    });

    it('C3 sin cliente resuelto guarda factura con cliente null', async () => {
      const pagoStub = { id: 11, reserva: null } as any;
      const facturaCreada = { pago: pagoStub, clienteFactura: null } as any;

      const dto = { idPago: 11 };

      pagosService.findPagoById.mockResolvedValue(pagoStub);
      facturaRepository.create.mockReturnValue(facturaCreada);
      facturaRepository.save.mockResolvedValue({ id: 2, ...facturaCreada });

      const result = await service.crearFactura(dto);

      expect(facturaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ clienteFactura: null }),
      );
      expect(result.id).toBe(2);
    });
  });

  describe('findByPago', () => {
    it('C1 retorna null cuando no hay factura para el pago', async () => {
      facturaRepository.findOne.mockResolvedValue(null);

      const result = await service.findByPago(999);

      expect(result).toBeNull();
    });

    it('C2 retorna factura transformada cuando existe', async () => {
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

  describe('findMisFacturas', () => {
    it('C2 multiples clienteFactura por usuario lanza BadRequest', async () => {
      clienteFacturaRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await expect(service.findMisFacturas(1)).rejects.toThrow(BadRequestException);
    });

    it('C3 un clienteFactura por usuario retorna sus facturas', async () => {
      const fakeFacturasEnMemoria = [{ id: 91 }, { id: 90 }];

      clienteFacturaRepository.find.mockResolvedValue([{ id: 5 }]);
      facturaRepository.find.mockResolvedValue(fakeFacturasEnMemoria);

      const result = await service.findMisFacturas(5);

      expect(facturaRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteFactura: { id: 5 } },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('C4 sin cliente por usuario retorna lista vacia', async () => {
      clienteFacturaRepository.find.mockResolvedValue([]);

      const result = await service.findMisFacturas(8);

      expect(result).toEqual([]);
    });
  });
});
