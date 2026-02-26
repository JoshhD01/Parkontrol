import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { CreateReservaDto } from './entities/dto/crear-reserva.dto';
import { VehiculosService } from 'src/vehiculos/vehiculos.service';
import { Vehiculo } from 'src/vehiculos/entities/vehiculo.entity';
import { CeldasService } from 'src/celdas/celdas.service';
import { ClienteFactura } from 'src/facturacion/entities/cliente-factura.entity';
import { ReservarClienteDto } from './entities/dto/reservar-cliente.dto';

@Injectable()
export class ReservasService implements OnModuleInit, OnModuleDestroy {
  private sincronizadorTimer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(ClienteFactura)
    private readonly clienteFacturaRepository: Repository<ClienteFactura>,
    private readonly vehiculosService: VehiculosService,
    private readonly celdasService: CeldasService,
  ) {}

  onModuleInit(): void {
    this.sincronizarEstadosPorHorario().catch(() => {
      return;
    });

    this.sincronizadorTimer = setInterval(() => {
      this.sincronizarEstadosPorHorario().catch(() => {
        return;
      });
    }, 30_000);
  }

  onModuleDestroy(): void {
    if (this.sincronizadorTimer) {
      clearInterval(this.sincronizadorTimer);
    }
  }

  async crear(createReservaDto: CreateReservaDto): Promise<Reserva> {
    await this.sincronizarEstadosPorHorario();

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

    const ahora = new Date();
    const horaInicio = createReservaDto.horaInicio
      ? new Date(createReservaDto.horaInicio)
      : ahora;
    const horaFin = createReservaDto.horaFin
      ? new Date(createReservaDto.horaFin)
      : null;

    if (Number.isNaN(horaInicio.getTime())) {
      throw new BadRequestException('horaInicio no tiene un formato válido');
    }

    if (horaFin && Number.isNaN(horaFin.getTime())) {
      throw new BadRequestException('horaFin no tiene un formato válido');
    }

    if (horaFin && horaFin <= horaInicio) {
      throw new BadRequestException(
        'La hora fin debe ser mayor que la hora inicio',
      );
    }

    await this.validarReglasReservaActiva(
      vehiculo,
      clienteFactura,
      celda.id,
      horaInicio,
      horaFin,
    );

    const reserva = this.reservaRepository.create({
      vehiculo,
      celda,
      clienteFactura: clienteFactura ?? undefined,
      estado: 'ABIERTA',
      fechaEntrada: horaInicio,
      fechaSalida: horaFin ?? null,
    });

    const reservaGuardada = await this.reservaRepository.save(reserva);

    if (horaInicio <= ahora && (!horaFin || horaFin > ahora)) {
      await this.celdasService.actualizarEstado(celda.id, 'OCUPADA');
    }

    return reservaGuardada;
  }

  async crearParaCliente(
    idClienteFactura: number,
    reservarClienteDto: ReservarClienteDto,
  ): Promise<Reserva> {
    const vehiculoExistente = await this.vehiculosService.findByPlaca(
      reservarClienteDto.placa,
    );

    if (
      vehiculoExistente &&
      vehiculoExistente.tipoVehiculo.id !== reservarClienteDto.idTipoVehiculo
    ) {
      throw new BadRequestException(
        'La placa ya existe con un tipo de vehículo diferente',
      );
    }

    const vehiculo = vehiculoExistente
      ? vehiculoExistente
      : await this.vehiculosService.crear({
          placa: reservarClienteDto.placa,
          idTipoVehiculo: reservarClienteDto.idTipoVehiculo,
        });

    const celdasParqueadero = await this.celdasService.findByParqueadero(
      reservarClienteDto.idParqueadero,
    );

    const celdaLibre = celdasParqueadero.find(
      (celda) =>
        celda.estado === 'LIBRE' &&
        celda.tipoCelda?.id === reservarClienteDto.idTipoVehiculo,
    );

    if (!celdaLibre) {
      throw new BadRequestException(
        'No hay celdas disponibles para el tipo de vehículo seleccionado en este parqueadero',
      );
    }

    return await this.crear({
      idVehiculo: vehiculo.id,
      idCelda: celdaLibre.id,
      estado: 'ABIERTA',
      idClienteFactura,
    });
  }

  async finalizarReserva(id: number): Promise<Reserva> {
    await this.sincronizarEstadosPorHorario();

    const reserva = await this.findReservaById(id);

    if (reserva.estado === 'CERRADA') {
      throw new BadRequestException('La reserva ya ha sido cerrada');
    }

    reserva.fechaSalida = new Date();
    reserva.estado = 'CERRADA';

    const reservaActualizada = await this.reservaRepository.save(reserva);

    const reservasActivasMismaCelda = await this.reservaRepository.count({
      where: { estado: 'ABIERTA', celda: { id: reserva.celda.id } },
    });

    if (reservasActivasMismaCelda === 0) {
      await this.celdasService.actualizarEstado(reserva.celda.id, 'LIBRE');
    }

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
    await this.sincronizarEstadosPorHorario();

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
    await this.sincronizarEstadosPorHorario();

    const ahora = new Date();
    return await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.vehiculo', 'vehiculo')
      .leftJoinAndSelect('vehiculo.tipoVehiculo', 'tipoVehiculo')
      .leftJoinAndSelect('reserva.celda', 'celda')
      .leftJoinAndSelect('celda.parqueadero', 'parqueadero')
      .leftJoinAndSelect('reserva.clienteFactura', 'clienteFactura')
      .leftJoinAndSelect('clienteFactura.usuario', 'usuario')
      .where('reserva.ESTADO = :estado', { estado: 'ABIERTA' })
      .andWhere('reserva."FECHA_ENTRADA" <= :ahora', { ahora })
      .andWhere('(reserva."FECHA_SALIDA" IS NULL OR reserva."FECHA_SALIDA" > :ahora)', {
        ahora,
      })
      .orderBy('reserva."FECHA_ENTRADA"', 'DESC')
      .getMany();
  }

  async findByClienteFactura(idClienteFactura: number): Promise<Reserva[]> {
    await this.sincronizarEstadosPorHorario();

    return await this.reservaRepository.find({
      where: { clienteFactura: { id: idClienteFactura } },
      relations: [
        'vehiculo',
        'vehiculo.tipoVehiculo',
        'celda',
        'celda.parqueadero',
        'clienteFactura',
      ],
      order: { fechaEntrada: 'DESC' },
    });
  }

  async findByClienteFacturaOrCorreo(
    idClienteFactura: number,
    correoCliente: string,
  ): Promise<Reserva[]> {
    await this.sincronizarEstadosPorHorario();

    const correoNormalizado = correoCliente.trim().toLowerCase();

    return await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.vehiculo', 'vehiculo')
      .leftJoinAndSelect('vehiculo.tipoVehiculo', 'tipoVehiculo')
      .leftJoinAndSelect('reserva.celda', 'celda')
      .leftJoinAndSelect('celda.parqueadero', 'parqueadero')
      .leftJoinAndSelect('reserva.clienteFactura', 'clienteFactura')
      .where('clienteFactura.ID_CLIENTE_FACTURA = :idClienteFactura', {
        idClienteFactura,
      })
      .orWhere(
        "LOWER(TRIM(clienteFactura.CORREO)) = LOWER(TRIM(:correoNormalizado))",
        {
        correoNormalizado,
        },
      )
      .orderBy('reserva.FECHA_ENTRADA', 'DESC')
      .getMany();
  }

  async findVehiculosByClienteFactura(
    idClienteFactura: number,
  ): Promise<Vehiculo[]> {
    const reservas = await this.findByClienteFactura(idClienteFactura);
    const mapVehiculos = new Map<number, Vehiculo>();

    for (const reserva of reservas) {
      if (reserva.vehiculo) {
        mapVehiculos.set(reserva.vehiculo.id, reserva.vehiculo);
      }
    }

    return Array.from(mapVehiculos.values());
  }

  async findVehiculosByClienteFacturaOrCorreo(
    idClienteFactura: number,
    correoCliente: string,
  ): Promise<Vehiculo[]> {
    const reservas = await this.findByClienteFacturaOrCorreo(
      idClienteFactura,
      correoCliente,
    );
    const mapVehiculos = new Map<number, Vehiculo>();

    for (const reserva of reservas) {
      if (reserva.vehiculo) {
        mapVehiculos.set(reserva.vehiculo.id, reserva.vehiculo);
      }
    }

    return Array.from(mapVehiculos.values());
  }

  private async validarReglasReservaActiva(
    vehiculo: Vehiculo,
    clienteFactura: ClienteFactura | null,
    idCelda: number,
    horaInicioNueva: Date,
    horaFinNueva: Date | null,
  ): Promise<void> {
    const reservaActivaPorPlaca = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.celda', 'celda')
      .leftJoinAndSelect('celda.parqueadero', 'parqueadero')
      .where('reserva.ESTADO = :estado', { estado: 'ABIERTA' })
      .andWhere('reserva."ID_VEHICULO" = :idVehiculo', {
        idVehiculo: vehiculo.id,
      })
      .andWhere('(reserva."FECHA_SALIDA" IS NULL OR reserva."FECHA_SALIDA" > :horaInicioNueva)', {
        horaInicioNueva,
      })
      .andWhere('(:horaFinNueva IS NULL OR reserva."FECHA_ENTRADA" < :horaFinNueva)', {
        horaFinNueva,
      })
      .getOne();

    if (reservaActivaPorPlaca) {
      const parqueadero = reservaActivaPorPlaca.celda?.parqueadero?.nombre;
      throw new BadRequestException(
        parqueadero
          ? `La placa ${vehiculo.placa} ya tiene una reserva activa en ${parqueadero}`
          : `La placa ${vehiculo.placa} ya tiene una reserva activa`,
      );
    }

    if (!clienteFactura?.correo) {
      return;
    }

    const correoNormalizado = clienteFactura.correo.trim().toLowerCase();
    const reservaActivaPorCorreo = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.celda', 'celda')
      .leftJoinAndSelect('celda.parqueadero', 'parqueadero')
      .leftJoin('reserva.clienteFactura', 'clienteFactura')
      .where('reserva.ESTADO = :estado', { estado: 'ABIERTA' })
      .andWhere(
        'LOWER(TRIM(clienteFactura.CORREO)) = LOWER(TRIM(:correoNormalizado))',
        { correoNormalizado },
      )
      .andWhere('(reserva."FECHA_SALIDA" IS NULL OR reserva."FECHA_SALIDA" > :horaInicioNueva)', {
        horaInicioNueva,
      })
      .andWhere('(:horaFinNueva IS NULL OR reserva."FECHA_ENTRADA" < :horaFinNueva)', {
        horaFinNueva,
      })
      .getOne();

    if (reservaActivaPorCorreo) {
      const parqueadero = (reservaActivaPorCorreo as any).celda?.parqueadero
        ?.nombre;
      throw new BadRequestException(
        parqueadero
          ? `El correo ${clienteFactura.correo} ya tiene una reserva activa en ${parqueadero}`
          : `El correo ${clienteFactura.correo} ya tiene una reserva activa`,
      );
    }

    const reservaActivaMismaCelda = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.ESTADO = :estado', { estado: 'ABIERTA' })
      .andWhere('reserva."ID_CELDA" = :idCelda', { idCelda })
      .andWhere('(reserva."FECHA_SALIDA" IS NULL OR reserva."FECHA_SALIDA" > :horaInicioNueva)', {
        horaInicioNueva,
      })
      .andWhere('(:horaFinNueva IS NULL OR reserva."FECHA_ENTRADA" < :horaFinNueva)', {
        horaFinNueva,
      })
      .getOne();

    if (reservaActivaMismaCelda) {
      throw new BadRequestException(
        'La celda seleccionada ya tiene una reserva activa en ese horario',
      );
    }
  }

  async sincronizarEstadosPorHorario(): Promise<void> {
    const ahora = new Date();

    const reservasParaCerrar = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.celda', 'celda')
      .where('reserva.ESTADO = :estado', { estado: 'ABIERTA' })
      .andWhere('reserva."FECHA_SALIDA" IS NOT NULL')
      .andWhere('reserva."FECHA_SALIDA" <= :ahora', { ahora })
      .getMany();

    const celdasImpactadas = new Set<number>();

    for (const reserva of reservasParaCerrar) {
      reserva.estado = 'CERRADA';
      await this.reservaRepository.save(reserva);
      if (reserva.celda?.id) {
        celdasImpactadas.add(reserva.celda.id);
      }
    }

    const reservasActivasEnHorario = await this.reservaRepository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.celda', 'celda')
      .where('reserva.ESTADO = :estado', { estado: 'ABIERTA' })
      .andWhere('reserva."FECHA_ENTRADA" <= :ahora', { ahora })
      .andWhere('(reserva."FECHA_SALIDA" IS NULL OR reserva."FECHA_SALIDA" > :ahora)', {
        ahora,
      })
      .getMany();

    const celdasActivas = new Set<number>();
    for (const reserva of reservasActivasEnHorario) {
      if (reserva.celda?.id) {
        celdasActivas.add(reserva.celda.id);
      }
    }

    const idsRevisar = new Set<number>([...celdasImpactadas, ...celdasActivas]);

    for (const idCelda of idsRevisar) {
      if (celdasActivas.has(idCelda)) {
        await this.celdasService.actualizarEstado(idCelda, 'OCUPADA');
      } else {
        await this.celdasService.actualizarEstado(idCelda, 'LIBRE');
      }
    }
  }
}
