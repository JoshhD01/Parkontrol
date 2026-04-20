import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';
import { Parqueadero } from 'src/entities/parqueaderos/entities/parqueadero.entity';
import { Celda } from 'src/entities/celdas/entities/celda.entity';
import { TipoCelda } from 'src/entities/shared/entities/tipo-celda.entity';
import { Sensor } from 'src/entities/shared/entities/sensor.entity';
import { EmpresasService } from 'src/service/empresas/empresas.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const parqueaderoRepository = makeStub(['find', 'findOne', 'create', 'save']);
  const celdaRepository = makeStub(['count', 'create', 'save']);
  const tipoCeldaRepository = makeStub(['findOne']);
  const sensorRepository = makeStub(['create', 'save']);
  const empresasService = makeStub(['findEmpresaById']);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ParqueaderosService,
      { provide: getRepositoryToken(Parqueadero), useValue: parqueaderoRepository },
      { provide: getRepositoryToken(Celda), useValue: celdaRepository },
      { provide: getRepositoryToken(TipoCelda), useValue: tipoCeldaRepository },
      { provide: getRepositoryToken(Sensor), useValue: sensorRepository },
      { provide: EmpresasService, useValue: empresasService },
    ],
  }).compile();

  const service = module.get<ParqueaderosService>(ParqueaderosService);

  return {
    service,
    parqueaderoRepository,
    celdaRepository,
    tipoCeldaRepository,
    sensorRepository,
    empresasService,
  };
}