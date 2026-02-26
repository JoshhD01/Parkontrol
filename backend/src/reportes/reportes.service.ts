import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reporte } from './entities/reporte.entity';
import { CreateReporteDto } from './entities/dto/crear-reporte.dto';
import { ParqueaderosService } from 'src/parqueaderos/parqueaderos.service';
import { Periodo } from 'src/shared/entities/periodo.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Reporte)
    private readonly reporteRepository: Repository<Reporte>,
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
    private readonly parqueaderosService: ParqueaderosService,
  ) {}

  async crear(createReporteDto: CreateReporteDto): Promise<Reporte> {
    const parqueadero = await this.parqueaderosService.findParqueaderoById(
      createReporteDto.idParqueadero,
    );
    const periodo = await this.periodoRepository.findOne({
      where: { id: createReporteDto.idPeriodo },
    });
    if (!periodo) {
      throw new NotFoundException(
        `No existe periodo con id: ${createReporteDto.idPeriodo}`,
      );
    }

    const reporte = this.reporteRepository.create({
      parqueadero,
      periodo,
      urlArchivo: createReporteDto.urlArchivo,
    });

    return await this.reporteRepository.save(reporte);
  }

  async findByParqueadero(idParqueadero: number): Promise<Reporte[]> {
    return await this.reporteRepository.find({
      where: { parqueadero: { id: idParqueadero } },
      relations: ['parqueadero', 'periodo'],
      order: { id: 'DESC' },
    });
  }

  async findReporteById(id: number): Promise<Reporte> {
    const reporte = await this.reporteRepository.findOne({
      where: { id },
      relations: ['parqueadero', 'periodo'],
    });
    if (!reporte) {
      throw new NotFoundException(`No existe reporte con id: ${id}`);
    }
    return reporte;
  }

  async actualizarUrl(id: number, urlArchivo: string): Promise<Reporte> {
    const reporte = await this.findReporteById(id);
    reporte.urlArchivo = urlArchivo;
    return await this.reporteRepository.save(reporte);
  }
}
