import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Parqueadero } from './entities/parqueadero.entity';
import { Repository } from 'typeorm';
import { CreateParqueaderoDto } from './entities/dto/crear-parqueadero.dto';
import { ParqueaderoResponseDto } from './entities/dto/parqueadero-response.dto';
import { EmpresasService } from 'src/empresas/empresas.service';

@Injectable()
export class ParqueaderosService {
  constructor(
    @InjectRepository(Parqueadero)
    private readonly parqueaderoRepository: Repository<Parqueadero>,
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

    return parqueadero;
  }

  async findAll(): Promise<ParqueaderoResponseDto[]> {
    const parqueaderos = await this.parqueaderoRepository.find({
      relations: ['empresa'],
    });
    return parqueaderos.map((p) => new ParqueaderoResponseDto(p));
  }

  async findByEmpresa(idEmpresa: number): Promise<ParqueaderoResponseDto[]> {
    const parqueaderos = await this.parqueaderoRepository.find({
      where: { empresa: { id: idEmpresa } },
      relations: ['empresa'],
    });
    return parqueaderos.map((p) => new ParqueaderoResponseDto(p));
  }

  async obtenerDetalle(id: number): Promise<ParqueaderoResponseDto> {
    const parqueadero = await this.findParqueaderoById(id);
    return new ParqueaderoResponseDto(parqueadero);
  }
}
