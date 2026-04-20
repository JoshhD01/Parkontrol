import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { TarifasService } from 'src/service/tarifas/tarifas.service';
import { Tarifa } from 'src/entities/tarifas/entities/tarifa.entity';
import { TipoVehiculo } from 'src/entities/shared/entities/tipo-vehiculo.entity';
import { ParqueaderosService } from 'src/service/parqueaderos/parqueaderos.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const tarifaRepository = makeStub([
    'findOne',
    'find',
    'create',
    'save',
  ]);

  const tipoVehiculoRepository = makeStub(['findOne']);

  const parqueaderosService = makeStub(['findParqueaderoById']);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      TarifasService,
      { provide: getRepositoryToken(Tarifa),       useValue: tarifaRepository },
      { provide: getRepositoryToken(TipoVehiculo), useValue: tipoVehiculoRepository },
      { provide: ParqueaderosService,              useValue: parqueaderosService },
    ],
  }).compile();

  const service = module.get<TarifasService>(TarifasService);

  return {
    service,
    tarifaRepository,
    tipoVehiculoRepository,
    parqueaderosService,
  };
}