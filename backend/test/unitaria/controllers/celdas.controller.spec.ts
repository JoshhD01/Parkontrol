import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { CeldasController } from 'src/controller/celdas/celdas.controller';
import { CeldasService } from 'src/service/celdas/celdas.service';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { TipoCelda } from 'src/entities/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/entities/shared/entities/sensor.entity';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const celdaRepository     = makeStub(['find', 'findOne', 'create', 'save']);
  const tipoCeldaRepository = makeStub(['findOne']);
  const sensorRepository    = makeStub(['findOne']);
  const parqueaderosService = makeStub(['findParqueaderoById']);

  const module: TestingModule = await Test.createTestingModule({
    controllers: [CeldasController],
    providers: [
      CeldasService,
      { provide: getRepositoryToken(Celda),     useValue: celdaRepository },
      { provide: getRepositoryToken(TipoCelda), useValue: tipoCeldaRepository },
      { provide: getRepositoryToken(Sensor),    useValue: sensorRepository },
      { provide: ParqueaderosService,           useValue: parqueaderosService },
    ],
  }).compile();

  const controller = module.get<CeldasController>(CeldasController);
  const service    = module.get<CeldasService>(CeldasService);

  return {
    controller,
    service,
    celdaRepository,
    tipoCeldaRepository,
    sensorRepository,
    parqueaderosService,
  };
}