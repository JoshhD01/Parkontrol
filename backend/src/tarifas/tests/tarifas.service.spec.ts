import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TarifasService } from '../tarifas.service';
import { Tarifa } from '../entities/tarifa.entity';
import { TipoVehiculo } from 'src/shared/entities/tipo-vehiculo.entity';
import { ParqueaderosService } from 'src/parqueaderos/parqueaderos.service';

export const createTestingModule = async () => {
  const tarifaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const tipoVehiculoRepository = {
    findOne: jest.fn(),
  };

  const parqueaderosService = {
    findParqueaderoById: jest.fn(),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      TarifasService,
      {
        provide: getRepositoryToken(Tarifa),
        useValue: tarifaRepository,
      },
      {
        provide: getRepositoryToken(TipoVehiculo),
        useValue: tipoVehiculoRepository,
      },
      {
        provide: ParqueaderosService,
        useValue: parqueaderosService,
      },
    ],
  }).compile();

  return {
    service: module.get<TarifasService>(TarifasService),
    tarifaRepository,
    tipoVehiculoRepository,
    parqueaderosService,
  };
};