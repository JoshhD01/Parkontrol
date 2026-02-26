import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacturaElectronica } from './entities/factura-electronica.entity';
import { ClienteFactura } from './entities/cliente-factura.entity';
import { CreateFacturaElectronicaDto } from './entities/dto/crear-factura-electronica.dto';
import { CreateClienteFacturaDto } from './entities/dto/crear-cliente-factura.dto';
import { PagosService } from 'src/pagos/pagos.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

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
  ): Promise<FacturaElectronica> {
    const pago = await this.pagosService.findPagoById(createFacturaDto.idPago);
    const cliente = createFacturaDto.idClienteFactura
      ? await this.clienteFacturaRepository.findOne({
          where: { id: createFacturaDto.idClienteFactura },
        })
      : (pago.reserva?.clienteFactura ?? null);

    if (!cliente) {
      throw new NotFoundException(
        'No existe cliente para facturar. Asocia un cliente a la reserva o envía idClienteFactura.',
      );
    }

    const factura = this.facturaRepository.create({
      pago,
      clienteFactura: cliente,
      cufe: createFacturaDto.cufe,
      urlPdf: createFacturaDto.urlPdf,
      enviada: 'N',
      fechaCreacion: new Date(),
    });

    return await this.facturaRepository.save(factura);
  }

  async marcarComoEnviada(id: number): Promise<FacturaElectronica> {
    const factura = await this.facturaRepository.findOne({ where: { id } });
    if (!factura) {
      throw new NotFoundException(`No existe factura con id: ${id}`);
    }
    factura.enviada = 'Y';
    return await this.facturaRepository.save(factura);
  }

  async findByPago(idPago: number): Promise<FacturaElectronica | null> {
    return await this.facturaRepository.findOne({
      where: { pago: { id: idPago } },
      relations: ['pago', 'clienteFactura'],
    });
  }

  async obtenerClientes(): Promise<ClienteFactura[]> {
    return await this.clienteFacturaRepository.find({ relations: ['usuario'] });
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
