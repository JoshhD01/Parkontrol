import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Celda } from './entities/celda.entity';
import { CreateCeldaDto } from './entities/dto/crear-celda.dto';
import { ParqueaderosService } from 'src/parqueaderos/parqueaderos.service';
import { TipoCelda } from 'src/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/shared/entities/sensor.entity';

@Injectable()
export class CeldasService {
  constructor(
    @InjectRepository(Celda)
    private readonly celdaRepository: Repository<Celda>,
    @InjectRepository(TipoCelda)
    private readonly tipoCeldaRepository: Repository<TipoCelda>,
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
    private readonly parqueaderosService: ParqueaderosService,
  ) {}

  async crear(createCeldaDto: CreateCeldaDto): Promise<Celda> {
    const parqueadero = await this.parqueaderosService.findParqueaderoById(
      createCeldaDto.idParqueadero,
    );
    const tipoCelda = await this.tipoCeldaRepository.findOne({
      where: { id: createCeldaDto.idTipoCelda },
    });
    if (!tipoCelda) {
      throw new NotFoundException(
        `No existe tipo de celda con id: ${createCeldaDto.idTipoCelda}`,
      );
    }
    const sensor = await this.sensorRepository.findOne({
      where: { id: createCeldaDto.idSensor },
    });
    if (!sensor) {
      throw new NotFoundException(
        `No existe sensor con id: ${createCeldaDto.idSensor}`,
      );
    }

    const celda = this.celdaRepository.create({
      estado: createCeldaDto.estado,
      parqueadero,
      tipoCelda,
      sensor,
    });

    return await this.celdaRepository.save(celda);
  }

  async findByParqueadero(idParqueadero: number): Promise<Celda[]> {
    return await this.celdaRepository.find({
      where: { parqueadero: { id: idParqueadero } },
      relations: ['parqueadero', 'tipoCelda', 'sensor'],
    });
  }

  async findCeldaById(id: number): Promise<Celda> {
    const celda = await this.celdaRepository.findOne({
      where: { id },
      relations: ['parqueadero', 'tipoCelda', 'sensor'],
    });
    if (!celda) {
      throw new NotFoundException(`No existe celda con id: ${id}`);
    }
    return celda;
  }

  async actualizarEstado(id: number, estado: string): Promise<Celda> {
    const celda = await this.findCeldaById(id);
    celda.estado = estado;
    celda.ultimoCambioEstado = new Date();
    return await this.celdaRepository.save(celda);
  }
}
