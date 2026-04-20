import { NotFoundException } from '@nestjs/common';
import { createTestingModule } from '../unitaria/facturacion/facturacion.service.module';

describe('FacturacionService Integration - obtenerPorPago', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('CS0001 - lanza NotFoundException cuando no existe factura para el pago', async () => {
    // Arrange
    const { controller, facturaRepository } = await createTestingModule();

    const pagoId = 999;

    facturaRepository.findOne.resolves(null);

    // Act
    const action = controller.obtenerPorPago(pagoId);

    // Assert
    await expect(action).rejects.toThrow(NotFoundException);

    expect(facturaRepository.findOne).toHaveBeenCalledWith({
      where: { pago: { id: pagoId } },
      relations: ['pago', 'clienteFactura'],
    });
  });

  it('CS0002 - retorna facturas del cliente autenticado', async () => {
    // Arrange
    const { controller, clienteFacturaRepository, facturaRepository } = await createTestingModule();

    const usuarioId = 5;

    const clienteStub = { id: 25, usuario: { id: usuarioId } };
    const facturasStub = [
      { id: 100, clienteFactura: clienteStub },
      { id: 101, clienteFactura: clienteStub },
    ];

    clienteFacturaRepository.find.mockResolvedValue([clienteStub]);
    facturaRepository.find.mockResolvedValue(facturasStub);

    const payload = {
      id: usuarioId,
      nombreRol: 'CLIENTE',
      correo: 'cliente@test.com',
    } as any;

    // Act
    const result = await controller.obtenerFacturasCliente(payload);

    // Assert
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 100 }),
        expect.objectContaining({ id: 101 }),
      ]),
    );
  });

  it('CS0003 - crea cliente y luego factura correctamente en flujo secuencial', async () => {
    // Arrange
    const { service, facturaRepository, clienteFacturaRepository, pagosService } =
      await createTestingModule();

    const clienteDto = {
      tipoDocumento: 'cc',
      numeroDocumento: '123456',
      correo: 'test@mail.com',
    };

    const clienteCreado = {
      id: 50,
      tipoDocumento: 'CC',
      numeroDocumento: '123456',
      correo: 'test@mail.com',
    };

    clienteFacturaRepository.findOne.mockResolvedValue(null);
    clienteFacturaRepository.create.mockReturnValue(clienteCreado);
    clienteFacturaRepository.save.mockResolvedValue(clienteCreado);

    // Act - crear cliente
    const cliente = await service.crearCliente(clienteDto as any);

    // Assert cliente
    expect(cliente.id).toBe(50);

    // Arrange factura
    const pagoStub = { id: 10, reserva: null };
    pagosService.findPagoById.mockResolvedValue(pagoStub);

    const facturaCreada = {
      id: 200,
      pago: pagoStub,
      clienteFactura: clienteCreado,
    };

    facturaRepository.create.mockReturnValue(facturaCreada);
    facturaRepository.save.mockResolvedValue(facturaCreada);

    // Act factura
    const factura = await service.crearFactura({
      idPago: 10,
      idClienteFactura: 50,
    } as any);

    // Assert factura
    expect(factura.clienteFactura.id).toBe(50);
    expect(factura.pago.id).toBe(10);
  });

  it('CS0004 - reutiliza cliente existente y actualiza datos', async () => {
    // Arrange
    const { service, clienteFacturaRepository } = await createTestingModule();

    const existente = {
      id: 75,
      tipoDocumento: 'CC',
      numeroDocumento: '987',
      correo: 'old@mail.com',
    };

    clienteFacturaRepository.findOne.mockResolvedValueOnce(null);
    clienteFacturaRepository.create.mockReturnValue(existente);
    clienteFacturaRepository.save.mockResolvedValueOnce(existente);

    await service.crearCliente({
      tipoDocumento: 'cc',
      numeroDocumento: '987',
      correo: 'a@mail.com',
    } as any);

    clienteFacturaRepository.findOne.mockResolvedValueOnce(existente);

    const actualizado = {
      ...existente,
      correo: 'new@mail.com',
    };

    clienteFacturaRepository.save.mockResolvedValueOnce(actualizado);

    // Act
    const result = await service.crearCliente({
      tipoDocumento: 'cc',
      numeroDocumento: '987',
      correo: 'new@mail.com',
    } as any);

    // Assert
    expect(result.id).toBe(75);
    expect(result.correo).toBe('new@mail.com');
  });

  it('CS0005 - retorna facturas ordenadas DESC por fecha', async () => {
    // Arrange
    const { service, facturaRepository } = await createTestingModule();

    const clienteId = 30;

    const facturas = [
      { id: 1, fechaCreacion: new Date('2024-01-03') },
      { id: 2, fechaCreacion: new Date('2024-01-02') },
      { id: 3, fechaCreacion: new Date('2024-01-01') },
    ];

    facturaRepository.find.mockResolvedValue(facturas);

    // Act
    const result = await service.findByClienteFactura(clienteId);

    // Assert
    expect(result).toHaveLength(3);
    expect(facturaRepository.find).toHaveBeenCalledWith({
      where: { clienteFactura: { id: clienteId } },
      relations: ['pago', 'clienteFactura'],
      order: { fechaCreacion: 'DESC' },
    });
  });
});