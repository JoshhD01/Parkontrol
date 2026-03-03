import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacturaElectronica } from './entities/factura-electronica.entity';
import { ClienteFactura } from './entities/cliente-factura.entity';
import { CreateFacturaElectronicaDto } from './entities/dto/crear-factura-electronica.dto';
import { CreateClienteFacturaDto } from './entities/dto/crear-cliente-factura.dto';
import { EmitirFacturaElectronicaDto } from './entities/dto/emitir-factura-electronica.dto';
import { PagosService } from 'src/pagos/pagos.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class FacturacionService {
  private static readonly CUFE_FACTURA_NORMAL_PREFIX = 'NF-';
  private static readonly TIPO_DOCUMENTO_FALLBACK = 'PAS';

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
    createFacturaDto: CreateFacturaElectronicaDto,
  ): Promise<any> {
    const pago = await this.pagosService.findPagoById(createFacturaDto.idPago);
    let cliente = await this.resolverClienteFactura(createFacturaDto, pago);

    const emitirElectronica =
      createFacturaDto.emitirElectronica ??
      Boolean(createFacturaDto.cufe?.trim().length);

    if (emitirElectronica && !createFacturaDto.cufe?.trim()) {
      throw new BadRequestException(
        'Para emitir factura electrónica debes enviar un CUFE válido.',
      );
    }

    if (emitirElectronica) {
      const correoElectronico = createFacturaDto.correoElectronico
        ?.trim()
        .toLowerCase();

      if (!correoElectronico) {
        throw new BadRequestException(
          'Para factura electrónica debes enviar correoElectronico.',
        );
      }

      if (!cliente) {
        cliente = await this.obtenerOCrearClienteOpcional(pago, correoElectronico);
      } else if (cliente.correo !== correoElectronico) {
        cliente.correo = correoElectronico;
        cliente = await this.clienteFacturaRepository.save(cliente);
      }
    } else if (!cliente) {
      cliente = await this.obtenerOCrearClienteOpcional(pago);
    }

    const cufe = emitirElectronica
      ? createFacturaDto.cufe!.trim()
      : this.generarCufeFacturaNormal(createFacturaDto.idPago);

    const factura = this.facturaRepository.create({
      pago,
      clienteFactura: cliente,
      cufe,
      urlPdf: emitirElectronica ? createFacturaDto.urlPdf : undefined,
      enviada: emitirElectronica ? 'N' : 'Y',
      fechaCreacion: new Date(),
    });

    const creada = await this.facturaRepository.save(factura);
    return this.toFacturaResponse(creada);
  }

  async emitirFacturaElectronica(
    id: number,
    dto: EmitirFacturaElectronicaDto,
  ): Promise<any> {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['pago', 'clienteFactura'],
    });
    if (!factura) {
      throw new NotFoundException(`No existe factura con id: ${id}`);
    }

    const correoElectronico = dto.correoElectronico.trim().toLowerCase();

    if (!factura.clienteFactura) {
      const pago = await this.pagosService.findPagoById(factura.pago.id);
      factura.clienteFactura = await this.obtenerOCrearClienteOpcional(
        pago,
        correoElectronico,
      );
    } else if (factura.clienteFactura.correo !== correoElectronico) {
      factura.clienteFactura.correo = correoElectronico;
      factura.clienteFactura = await this.clienteFacturaRepository.save(
        factura.clienteFactura,
      );
    }

    factura.cufe = dto.cufe.trim();
    factura.urlPdf = dto.urlPdf;
    factura.enviada = 'N';
    const actualizada = await this.facturaRepository.save(factura);
    return this.toFacturaResponse(actualizada);
  }

  async marcarComoEnviada(id: number): Promise<any> {
    const factura = await this.facturaRepository.findOne({ where: { id } });
    if (!factura) {
      throw new NotFoundException(`No existe factura con id: ${id}`);
    }

    if (!this.esFacturaElectronica(factura.cufe)) {
      throw new BadRequestException(
        'La factura normal no requiere marcado de envío electrónico.',
      );
    }

    factura.enviada = 'Y';
    const actualizada = await this.facturaRepository.save(factura);
    return this.toFacturaResponse(actualizada);
  }

  async findByPago(idPago: number): Promise<any | null> {
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
      relations: ['pago', 'clienteFactura'],
      order: { fechaCreacion: 'DESC' },
    });

    return facturas.map((factura) => this.toFacturaResponse(factura));
  }

  async findByClienteFacturaOrCorreo(
    idClienteFactura: number,
    correoCliente: string,
  ): Promise<any[]> {
    const correoNormalizado = correoCliente.trim().toLowerCase();

    const facturas = await this.facturaRepository
      .createQueryBuilder('factura')
      .leftJoinAndSelect('factura.pago', 'pago')
      .leftJoinAndSelect('factura.clienteFactura', 'clienteFactura')
      .where('clienteFactura.ID_CLIENTE_FACTURA = :idClienteFactura', {
        idClienteFactura,
      })
      .orWhere(
        "LOWER(TRIM(clienteFactura.CORREO)) = LOWER(TRIM(:correoNormalizado))",
        {
        correoNormalizado,
        },
      )
      .orderBy('factura.FECHA_CREACION', 'DESC')
      .getMany();

    return facturas.map((factura) => this.toFacturaResponse(factura));
  }

  private async resolverClienteFactura(
    createFacturaDto: CreateFacturaElectronicaDto,
    pago: Awaited<ReturnType<PagosService['findPagoById']>>,
  ): Promise<ClienteFactura | null> {
    return createFacturaDto.idClienteFactura
      ? await this.clienteFacturaRepository.findOne({
          where: { id: createFacturaDto.idClienteFactura },
        })
      : (pago.reserva?.clienteFactura ?? null);
  }

  private async obtenerOCrearClienteOpcional(
    pago: Awaited<ReturnType<PagosService['findPagoById']>>,
    correoElectronico?: string,
  ): Promise<ClienteFactura> {
    const placaRaw =
      pago.reserva?.vehiculo?.placa?.toString().trim().toUpperCase() ??
      `PAGO${pago.id}`;
    const placaNormalizada = placaRaw.replace(/[^A-Z0-9]/g, '');
    const numeroDocumentoBase = `PLACA${placaNormalizada}`
      .slice(0, 20)
      .padEnd(5, 'X');
    const correo =
      correoElectronico?.trim().toLowerCase() ??
      `factura+${placaNormalizada.toLowerCase()}@parkontrol.local`;

    const existente = await this.clienteFacturaRepository.findOne({
      where: {
        tipoDocumento: FacturacionService.TIPO_DOCUMENTO_FALLBACK,
        numeroDocumento: numeroDocumentoBase,
      },
    });

    if (existente) {
      if (existente.correo !== correo) {
        existente.correo = correo;
        return await this.clienteFacturaRepository.save(existente);
      }

      return existente;
    }

    const cliente = this.clienteFacturaRepository.create({
      tipoDocumento: FacturacionService.TIPO_DOCUMENTO_FALLBACK,
      numeroDocumento: numeroDocumentoBase,
      correo,
    });

    return await this.clienteFacturaRepository.save(cliente);
  }

  private generarCufeFacturaNormal(idPago: number): string {
    return `${FacturacionService.CUFE_FACTURA_NORMAL_PREFIX}${idPago}-${Date.now()}`;
  }

  private esFacturaElectronica(cufe?: string | null): boolean {
    if (!cufe) {
      return false;
    }

    return !cufe.startsWith(FacturacionService.CUFE_FACTURA_NORMAL_PREFIX);
  }

  private toFacturaResponse(factura: FacturaElectronica): any {
    const esElectronica = this.esFacturaElectronica(factura.cufe);

    return {
      ...factura,
      tipoFactura: esElectronica ? 'ELECTRONICA' : 'NORMAL',
      cufe: esElectronica ? factura.cufe : null,
      enviada: esElectronica ? factura.enviada === 'Y' : false,
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
