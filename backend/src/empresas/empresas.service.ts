import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Repository } from 'typeorm';
import { CreateEmpresaDto } from './entities/dto/crear-empresa.dto';
import { EmpresaResponseDto } from './entities/dto/empresa-response.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async crear(createEmpresaDto: CreateEmpresaDto): Promise<EmpresaResponseDto> {
    const empresa = this.empresaRepository.create(createEmpresaDto);
    const empresaGuardada = await this.empresaRepository.save(empresa);
    return new EmpresaResponseDto(empresaGuardada);
  }

  async findEmpresaById(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOneBy({ id });
    if (!empresa) {
      throw new NotFoundException(`Empresa con id: ${id} no existe`);
    }
    return empresa;
  }

  async findAll(): Promise<EmpresaResponseDto[]> {
    const empresas = await this.empresaRepository.find();
    return empresas.map((empresa) => new EmpresaResponseDto(empresa));
  }

  async obtenerDetalle(id: number): Promise<EmpresaResponseDto> {
    const empresa = await this.findEmpresaById(id);
    return new EmpresaResponseDto(empresa);
  }

  async obtenerTodas(): Promise<EmpresaResponseDto[]> {
    return this.findAll();
  }
}
