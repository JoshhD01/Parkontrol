import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { ParqueaderosService } from './parqueaderos.service';
import { Parqueadero } from './entities/parqueadero.entity';
import { EmpresasService } from 'src/empresas/empresas.service';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { Celda } from 'src/celdas/entities/celda.entity';
import { TipoCelda } from 'src/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/shared/entities/sensor.entity';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock;
};
