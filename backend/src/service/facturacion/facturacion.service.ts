import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacturaElectronica } from 'src/entities/facturacion/entities/factura-electronica.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { CreateFacturaDto } from 'src/controller/facturacion/dto/crear-factura-electronica.dto';
import { CreateClienteFacturaDto } from 'src/controller/facturacion/dto/crear-cliente-factura.dto';
import { PagosService } from 'src/service/pagos/pagos.service';
import { Usuario } from 'src/entities/usuarios/entities/usuario.entity';
@Injectable()
export class FacturacionService {
  constructor(
    @InjectRepository(FacturaElectronica)
    private readonly facturaRepository: Repository<FacturaElectronica>,
    @InjectRepository(ClienteFactura)
    private readonly clienteFacturaRepository: Repository<ClienteFactura>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly pagosService: PagosService,
  ) {}

  async crearCliente(
    createClienteDto: CreateClienteFacturaDto,
  ): Promise<ClienteFactura> {
    createClienteDto.tipoDocumento = createClienteDto.tipoDocumento
      .trim()
      .toUpperCase();
    createClienteDto.numeroDocumento = createClienteDto.numeroDocumento
      .trim()
      .toUpperCase();
    createClienteDto.correo = createClienteDto.correo.trim().toLowerCase();

    const usuario = await this.resolverUsuario(createClienteDto.idUsuario);
    const clienteExistente = await this.clienteFacturaRepository.findOne({
      where: {
        tipoDocumento: createClienteDto.tipoDocumento,
        numeroDocumento: createClienteDto.numeroDocumento,
      },
      relations: ['usuario'],
    });

    if (clienteExistente) {
      clienteExistente.correo = createClienteDto.correo;
      if (usuario) {
        clienteExistente.usuario = usuario;
      }
      return await this.clienteFacturaRepository.save(clienteExistente);
    }

    const cliente = this.clienteFacturaRepository.create({
      tipoDocumento: createClienteDto.tipoDocumento,
      numeroDocumento: createClienteDto.numeroDocumento,
      correo: createClienteDto.correo,
      usuario: usuario ?? undefined,
    });

    return await this.clienteFacturaRepository.save(cliente);
  }

  async crearFactura(
    createFacturaDto: CreateFacturaDto,
  ): Promise<any> {
    const facturaExistente = await this.facturaRepository.findOne({
      where: { pago: { id: createFacturaDto.idPago } },
      relations: ['pago', 'pago.metodoPago', 'clienteFactura'],
    });
    if (facturaExistente) {
      return this.toFacturaResponse(facturaExistente);
    }

    const pago = await this.pagosService.findPagoById(createFacturaDto.idPago);
    const cliente = await this.resolverClienteFactura(createFacturaDto, pago);

    const factura = this.facturaRepository.create({
      pago,
      clienteFactura: cliente ?? null,
      cufe: this.generarCodigoFactura(createFacturaDto.idPago),
      urlPdf: undefined,
      enviada: 'Y',
      fechaCreacion: new Date(),
    });

    const creada = await this.facturaRepository.save(factura);
    return this.toFacturaResponse(creada);
  }

  async findByPago(idPago: number): Promise<unknown> {
    const factura = await this.facturaRepository.findOne({
      where: { pago: { id: idPago } },
      relations: ['pago', 'clienteFactura'],
    });

    return factura ? this.toFacturaResponse(factura) : null;
  }

  async obtenerClientes(): Promise<ClienteFactura[]> {
    return await this.clienteFacturaRepository.find({ relations: ['usuario'] });
  }

  async findByClienteFactura(
    idClienteFactura: number,
  ): Promise<any[]> {
    const facturas = await this.facturaRepository.find({
      where: { clienteFactura: { id: idClienteFactura } },
      relations: ['pago', 'pago.metodoPago', 'clienteFactura'],
      order: { fechaCreacion: 'DESC' },
    });

    return facturas.map((factura) => this.toFacturaResponse(factura));
  }

  async findMisFacturas(
    idUsuario: number,
    correoCliente: string,
  ): Promise<any[]> {
    const correoNormalizado = correoCliente.trim().toLowerCase();

    const facturas = await this.facturaRepository
      .createQueryBuilder('factura')
      .leftJoinAndSelect('factura.pago', 'pago')
      .leftJoinAndSelect('pago.metodoPago', 'metodoPago')
      .leftJoinAndSelect('factura.clienteFactura', 'clienteFacturaFactura')
      .leftJoinAndSelect('clienteFacturaFactura.usuario', 'usuarioFactura')
      .leftJoinAndSelect('pago.reserva', 'reserva')
      .leftJoinAndSelect('reserva.clienteFactura', 'clienteFacturaReserva')
      .leftJoinAndSelect('clienteFacturaReserva.usuario', 'usuarioReserva')
      .where('usuarioFactura.id = :idUsuario', { idUsuario })
      .orWhere('usuarioReserva.id = :idUsuario', { idUsuario })
      .orWhere(
        'LOWER(TRIM(clienteFacturaFactura.CORREO)) = LOWER(TRIM(:correoNormalizado))',
        { correoNormalizado },
      )
      .orWhere(
        'LOWER(TRIM(clienteFacturaReserva.CORREO)) = LOWER(TRIM(:correoNormalizado))',
        { correoNormalizado },
      )
      .orderBy('factura.FECHA_CREACION', 'DESC')
      .getMany();

    return facturas.map((factura) => this.toFacturaResponse(factura));
  }

  private async resolverClienteFactura(
    createFacturaDto: CreateFacturaDto,
    pago: Awaited<ReturnType<PagosService['findPagoById']>>,
  ): Promise<ClienteFactura | null> {
    return createFacturaDto.idClienteFactura
      ? await this.clienteFacturaRepository.findOne({
          where: { id: createFacturaDto.idClienteFactura },
        })
      : (pago.reserva?.clienteFactura ?? null);
  }

  private generarCodigoFactura(idPago: number): string {
    return `NF-${idPago}-${Date.now()}`;
  }

  private toFacturaResponse(factura: FacturaElectronica): any {
    return {
      ...factura,
      tipoFactura: 'NORMAL',
      cufe: null,
      enviada: false,
    };
  }

  private async resolverUsuario(idUsuario?: number): Promise<Usuario | null> {
    if (!idUsuario) {
      return null;
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: idUsuario },
    });
    if (!usuario) {
      throw new NotFoundException(`No existe usuario con id: ${idUsuario}`);
    }

    return usuario;
  }
}
