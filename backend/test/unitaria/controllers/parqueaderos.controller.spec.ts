import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { ParqueaderosController } from 'src/controller/parqueaderos/parqueaderos.controller';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';
import { Parqueadero } from 'src/entities/parqueaderos/entities/parqueadero.entity';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { TipoCelda } from 'src/entities/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/entities/shared/entities/sensor.entity';
import { EmpresasService } from 'src/service/empresas/empresas.service';
import { Empresa } from 'src/entities/empresas/entities/empresa.entity';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const parqueaderoRepository = makeStub(['find', 'findOne', 'create', 'save', 'count']);
  const celdaRepository       = makeStub(['find', 'findOne', 'create', 'save', 'count']);
  const tipoCeldaRepository   = makeStub(['findOne']);
  const sensorRepository      = makeStub(['create', 'save']);
  const empresaRepository     = makeStub(['find', 'findOneBy', 'create', 'save']);

  const module: TestingModule = await Test.createTestingModule({
    controllers: [ParqueaderosController],
    providers: [
      ParqueaderosService,
      EmpresasService,
      { provide: getRepositoryToken(Parqueadero), useValue: parqueaderoRepository },
      { provide: getRepositoryToken(Celda),       useValue: celdaRepository },
      { provide: getRepositoryToken(TipoCelda),   useValue: tipoCeldaRepository },
      { provide: getRepositoryToken(Sensor),      useValue: sensorRepository },
      { provide: getRepositoryToken(Empresa),     useValue: empresaRepository },
    ],
  }).compile();

  const controller = module.get<ParqueaderosController>(ParqueaderosController);
  const service    = module.get<ParqueaderosService>(ParqueaderosService);

  return {
    controller,
    service,
    parqueaderoRepository,
    celdaRepository,
    tipoCeldaRepository,
    sensorRepository,
    empresaRepository,
  };
}