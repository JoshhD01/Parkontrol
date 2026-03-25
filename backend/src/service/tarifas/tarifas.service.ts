import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarifa } from 'src/entities/tarifas/entities/tarifa.entity';
import { CreateTarifaDto } from 'src/controller/tarifas/dto/crear-tarifa.dto';
import { UpdateTarifaDto } from 'src/controller/tarifas/dto/actualizar-tarifa.dto';
import { ParqueaderosService } from '../parqueaderos/parqueaderos.service';
import { TipoVehiculo } from 'src/entities/shared/entities/tipo-vehiculo.entity';

@Injectable()
export class TarifasService {
  constructor(
    @InjectRepository(Tarifa)
    private readonly tarifaRepository: Repository<Tarifa>,
    @InjectRepository(TipoVehiculo)
    private readonly tipoVehiculoRepository: Repository<TipoVehiculo>,
    private readonly parqueaderosService: ParqueaderosService,
  ) {}

  async crear(createTarifaDto: CreateTarifaDto): Promise<Tarifa> {
    const parqueadero = await this.parqueaderosService.findParqueaderoById( 
      createTarifaDto.idParqueadero,
    );
    const tipoVehiculo = await this.tipoVehiculoRepository.findOne({ 
      where: { id: createTarifaDto.idTipoVehiculo },
    });
    if (!tipoVehiculo) { 
      throw new NotFoundException( 
        "No existe tipo de vehículo con id: ${createTarifaDto.idTipoVehiculo}",
      );
    }

    const tarifa = this.tarifaRepository.create({ 
      parqueadero,
      tipoVehiculo,
      precioFraccionHora: createTarifaDto.precioFraccionHora,
      precioHoraAdicional: createTarifaDto.precioHoraAdicional,
    });

    return await this.tarifaRepository.save(tarifa);
  }

  async findByParqueadero(idParqueadero: number): Promise<Tarifa[]> {
    if (!idParqueadero || idParqueadero <= 0) { 
      throw new BadRequestException('El idParqueadero es inválido'); 
    }

    const parqueadero =
      await this.parqueaderosService.findParqueaderoById(idParqueadero); 

    if (!parqueadero) { 
      throw new NotFoundException( 
        "No existe parqueadero con id: ${idParqueadero}",
      );
    }

    const tarifas = await this.tarifaRepository.find({ 
      where: { parqueadero: { id: idParqueadero } },
      relations: ['parqueadero', 'tipoVehiculo'],
    });

    return tarifas; 
  }


  async findByParqueaderoYTipo(
    idParqueadero: number,
    idTipoVehiculo: number,
  ): Promise<Tarifa | null> {

    if (!idParqueadero || idParqueadero <= 0) { 
      throw new BadRequestException('El idParqueadero es inválido'); 
    }

    if (!idTipoVehiculo || idTipoVehiculo <= 0) { 
      throw new BadRequestException('El idTipoVehiculo es inválido'); 
    }


    const parqueadero =
      await this.parqueaderosService.findParqueaderoById(idParqueadero); 

    if (!parqueadero) { 
      throw new NotFoundException( 
        "No existe parqueadero con id: ${idParqueadero}",
      );
    }

    const tipoVehiculo = await this.tipoVehiculoRepository.findOne({ 
      where: { id: idTipoVehiculo },
    });

    if (!tipoVehiculo) { 
      throw new NotFoundException( 
        "No existe tipo de vehículo con id: ${idTipoVehiculo}",
      );
    }


    const tarifa = await this.tarifaRepository.findOne({ 
      where: {
        parqueadero: { id: idParqueadero },
        tipoVehiculo: { id: idTipoVehiculo },
      },
      relations: ['parqueadero', 'tipoVehiculo'],
    });


    return tarifa; 
  }

  async actualizar(id: number, updateData: UpdateTarifaDto): Promise<Tarifa> {
    const tarifa = await this.tarifaRepository.findOne({ 
      where: { id },
      relations: ['parqueadero', 'tipoVehiculo'],
    });

    if (!tarifa) { 
      throw new NotFoundException("No existe tarifa con id: ${id}"); 
    }

    if (updateData.precioFraccionHora !== undefined) { 
      tarifa.precioFraccionHora = updateData.precioFraccionHora; 
    }

    if (updateData.precioHoraAdicional !== undefined) { 
      tarifa.precioHoraAdicional = updateData.precioHoraAdicional; 
    }

    await this.tarifaRepository.save(tarifa); 

    const tarifaActualizada = await this.tarifaRepository.findOne({ 
      where: { id },
      relations: ['parqueadero', 'tipoVehiculo'],
    });

    if (!tarifaActualizada) { 
      throw new NotFoundException( 
        "No se pudo recuperar la tarifa actualizada con id: ${id}",
      );
    }

    return tarifaActualizada; 
  }

  async findTarifaById(id: number): Promise<Tarifa> {

    if (!id || id <= 0) { 
      throw new BadRequestException('El id de la tarifa es inválido'); 
    }

    const tarifa = await this.tarifaRepository.findOne({ 
      where: { id },
      relations: ['parqueadero', 'tipoVehiculo'],
    });

    if (!tarifa) { 
      throw new NotFoundException("No existe tarifa con id: ${id}"); 
    }

    return tarifa; 
  }
}