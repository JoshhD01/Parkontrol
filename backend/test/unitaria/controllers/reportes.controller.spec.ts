import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { ReportesController } from 'src/controller/reportes/reportes.controller';
import { ReportesService } from 'src/service/reportes/reportes.service';
import { Reporte } from 'src/entities/reportes/entities/reporte.entity';
import { Periodo } from 'src/entities/shared/entities/periodo.entity';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const reporteRepository = makeStub(['find', 'findOne', 'create', 'save']);
  const periodoRepository = makeStub(['findOne']);
  const parqueaderosService = makeStub(['findParqueaderoById']);

  const module: TestingModule = await Test.createTestingModule({
    controllers: [ReportesController],
    providers: [
      ReportesService,
      { provide: getRepositoryToken(Reporte), useValue: reporteRepository },
      { provide: getRepositoryToken(Periodo), useValue: periodoRepository },
      { provide: ParqueaderosService, useValue: parqueaderosService },
    ],
  }).compile();

  const controller = module.get<ReportesController>(ReportesController);
  const service = module.get<ReportesService>(ReportesService);

  return {
    controller,
    service,
    reporteRepository,
    periodoRepository,
    parqueaderosService,
  };
}