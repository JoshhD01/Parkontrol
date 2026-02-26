import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { CreateReservaDto } from './entities/dto/crear-reserva.dto';
import { VehiculosService } from 'src/vehiculos/vehiculos.service';
import { CeldasService } from 'src/celdas/celdas.service';
import { ClienteFactura } from 'src/facturacion/entities/cliente-factura.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(ClienteFactura)
    private readonly clienteFacturaRepository: Repository<ClienteFactura>,
    private readonly vehiculosService: VehiculosService,
    private readonly celdasService: CeldasService,
  ) {}

  async crear(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const vehiculo = await this.vehiculosService.findVehiculoById(
      createReservaDto.idVehiculo,
    );
    const celda = await this.celdasService.findCeldaById(
      createReservaDto.idCelda,
    );
    let clienteFactura: ClienteFactura | null = null;

    if (createReservaDto.idClienteFactura) {
      clienteFactura = await this.clienteFacturaRepository.findOne({
        where: { id: createReservaDto.idClienteFactura },
      });

      if (!clienteFactura) {
        throw new NotFoundException(
          `No existe cliente con id: ${createReservaDto.idClienteFactura}`,
        );
      }
    }

    if (celda.estado !== 'LIBRE') {
      throw new BadRequestException('La celda no está LIBRE');
    }

    const reserva = this.reservaRepository.create({
      vehiculo,
      celda,
      clienteFactura: clienteFactura ?? undefined,
      estado: createReservaDto.estado,
      fechaEntrada: new Date(),
    });

    const reservaGuardada = await this.reservaRepository.save(reserva);

    await this.celdasService.actualizarEstado(celda.id, 'OCUPADA');

    return reservaGuardada;
  }

  async finalizarReserva(id: number): Promise<Reserva> {
    const reserva = await this.findReservaById(id);

    if (reserva.fechaSalida) {
      throw new BadRequestException('La reserva ya ha sido cerrada');
    }

    reserva.fechaSalida = new Date();
    reserva.estado = 'CERRADA';

    const reservaActualizada = await this.reservaRepository.save(reserva);

    await this.celdasService.actualizarEstado(reserva.celda.id, 'LIBRE');

    return reservaActualizada;
  }

  async findReservaById(id: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: [
        'vehiculo',
        'vehiculo.tipoVehiculo',
        'celda',
        'celda.parqueadero',
        'clienteFactura',
        'clienteFactura.usuario',
      ],
    });
    if (!reserva) {
      throw new NotFoundException(`No existe reserva con id: ${id}`);
    }
    return reserva;
  }

  async findByParqueadero(idParqueadero: number): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { celda: { parqueadero: { id: idParqueadero } } },
      relations: [
        'vehiculo',
        'vehiculo.tipoVehiculo',
        'celda',
        'clienteFactura',
        'clienteFactura.usuario',
      ],
      order: { fechaEntrada: 'DESC' },
    });
  }

  async findActivas(): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { estado: 'ABIERTA' },
      relations: [
        'vehiculo',
        'vehiculo.tipoVehiculo',
        'celda',
        'celda.parqueadero',
        'clienteFactura',
        'clienteFactura.usuario',
      ],
    });
  }
}
