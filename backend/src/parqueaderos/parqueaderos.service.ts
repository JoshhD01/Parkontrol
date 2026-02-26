import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Parqueadero } from './entities/parqueadero.entity';
import { Repository } from 'typeorm';
import { CreateParqueaderoDto } from './entities/dto/crear-parqueadero.dto';
import { ParqueaderoResponseDto } from './entities/dto/parqueadero-response.dto';
import { EmpresasService } from 'src/empresas/empresas.service';
import { Celda } from 'src/celdas/entities/celda.entity';
import { TipoCelda } from 'src/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/shared/entities/sensor.entity';

@Injectable()
export class ParqueaderosService {
  constructor(
    @InjectRepository(Parqueadero)
    private readonly parqueaderoRepository: Repository<Parqueadero>,
    @InjectRepository(Celda)
    private readonly celdaRepository: Repository<Celda>,
    @InjectRepository(TipoCelda)
    private readonly tipoCeldaRepository: Repository<TipoCelda>,
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
    private readonly empresasService: EmpresasService,
  ) {}

  async crear(
    createParqueaderoDto: CreateParqueaderoDto,
  ): Promise<ParqueaderoResponseDto> {
    const empresa = await this.empresasService.findEmpresaById(
      createParqueaderoDto.idEmpresa,
    );

    const parqueadero = this.parqueaderoRepository.create({
      nombre: createParqueaderoDto.nombre,
      capacidadTotal: createParqueaderoDto.capacidadTotal,
      ubicacion: createParqueaderoDto.ubicacion,
      empresa,
    });

    const parqueaderoGuardado =
      await this.parqueaderoRepository.save(parqueadero);

    await this.asegurarCapacidadCeldas(parqueaderoGuardado);

    return new ParqueaderoResponseDto(parqueaderoGuardado);
  }

  async findParqueaderoById(id: number): Promise<Parqueadero> {
    const parqueadero = await this.parqueaderoRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!parqueadero) {
      throw new NotFoundException(`Parqueadero con id: ${id} no existe`);
    }

    await this.asegurarCapacidadCeldas(parqueadero);

    return parqueadero;
  }

  async findAll(): Promise<ParqueaderoResponseDto[]> {
    const parqueaderos = await this.parqueaderoRepository.find({
      relations: ['empresa'],
    });

    for (const parqueadero of parqueaderos) {
      await this.asegurarCapacidadCeldas(parqueadero);
    }

    return parqueaderos.map((p) => new ParqueaderoResponseDto(p));
  }

  async findAllConDisponibilidad(): Promise<(ParqueaderoResponseDto & { celdasDisponibles: number })[]> {
    const parqueaderos = await this.parqueaderoRepository.find({
      relations: ['empresa'],
    });

    const resultado: (ParqueaderoResponseDto & { celdasDisponibles: number })[] = [];

    for (const parqueadero of parqueaderos) {
      await this.asegurarCapacidadCeldas(parqueadero);

      const celdasLibres = await this.celdaRepository.count({
        where: { parqueadero: { id: parqueadero.id }, estado: 'LIBRE' },
      });

      resultado.push({
        ...new ParqueaderoResponseDto(parqueadero),
        celdasDisponibles: celdasLibres,
      });
    }

    return resultado;
  }

  async findByEmpresa(idEmpresa: number): Promise<ParqueaderoResponseDto[]> {
    const parqueaderos = await this.parqueaderoRepository.find({
      where: { empresa: { id: idEmpresa } },
      relations: ['empresa'],
    });

    for (const parqueadero of parqueaderos) {
      await this.asegurarCapacidadCeldas(parqueadero);
    }

    return parqueaderos.map((p) => new ParqueaderoResponseDto(p));
  }

  async obtenerDetalle(id: number): Promise<ParqueaderoResponseDto> {
    const parqueadero = await this.findParqueaderoById(id);
    return new ParqueaderoResponseDto(parqueadero);
  }

  private async asegurarCapacidadCeldas(parqueadero: Parqueadero): Promise<void> {
    const capacidad = Math.max(0, Number(parqueadero.capacidadTotal ?? 0));
    if (capacidad === 0) {
      return;
    }

    const totalCeldasActuales = await this.celdaRepository.count({
      where: { parqueadero: { id: parqueadero.id } },
    });

    if (totalCeldasActuales >= capacidad) {
      return;
    }

    const tipoCeldaDefault = await this.obtenerTipoCeldaDefault();
    const faltantes = capacidad - totalCeldasActuales;

    const sensores = Array.from({ length: faltantes }, (_, index) =>
      this.sensorRepository.create({
        descripcion: `Sensor ${parqueadero.id}-${totalCeldasActuales + index + 1}`,
      }),
    );

    const sensoresGuardados = await this.sensorRepository.save(sensores);

    const celdasNuevas = sensoresGuardados.map((sensor) =>
      this.celdaRepository.create({
        estado: 'LIBRE',
        ultimoCambioEstado: new Date(),
        parqueadero,
        tipoCelda: tipoCeldaDefault,
        sensor,
      }),
    );

    await this.celdaRepository.save(celdasNuevas);
  }

  private async obtenerTipoCeldaDefault(): Promise<TipoCelda> {
    const tipoParticular = await this.tipoCeldaRepository.findOne({
      where: { nombre: 'PARTICULAR' },
    });

    if (tipoParticular) {
      return tipoParticular;
    }

    const tipoCelda = await this.tipoCeldaRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    if (!tipoCelda) {
      throw new NotFoundException(
        'No existe tipo de celda para inicializar capacidad del parqueadero',
      );
    }

    return tipoCelda;
  }
}
