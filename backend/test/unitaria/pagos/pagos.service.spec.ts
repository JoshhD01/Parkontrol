import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { PagosService } from 'src/service/pagos/pagos.service';
import { Pago } from 'src/entities/pagos/entities/pago.entity';
import { MetodoPago } from 'src/entities/shared/entities/metodo-pago.entity';
import { ReservasService } from 'src/service/reservas/reservas.service';
import { TarifasService } from 'src/service/tarifas/tarifas.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const pagoRepository = makeStub([
    'findOne',
    'find',
    'create',
    'save',
    'createQueryBuilder',
  ]);

  const metodoPagoRepository = makeStub(['findOne']);

  const reservasService = makeStub(['findReservaById', 'finalizarReserva']);

  const tarifasService = makeStub(['findByParqueaderoYTipo']);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      PagosService,
      { provide: getRepositoryToken(Pago),       useValue: pagoRepository },
      { provide: getRepositoryToken(MetodoPago), useValue: metodoPagoRepository },
      { provide: ReservasService,                useValue: reservasService },
      { provide: TarifasService,                 useValue: tarifasService },
    ],
  }).compile();

  const service = module.get<PagosService>(PagosService);

  return {
    service,
    pagoRepository,
    metodoPagoRepository,
    reservasService,
    tarifasService,
  };
}