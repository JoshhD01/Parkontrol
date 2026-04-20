import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { VehiculosService } from 'src/service/vehiculos/vehiculos.service';
import { Vehiculo } from 'src/entities/vehiculos/entities/vehiculo.entity';
import { TipoVehiculo } from 'src/entities/shared/entities/tipo-vehiculo.entity';
import { Reserva } from 'src/entities/reservas/entities/reserva.entity';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const vehiculoRepository = makeStub(['find', 'findOne', 'create', 'save']);
  const tipoVehiculoRepository = makeStub(['find', 'findOne']);
  const reservaRepository = makeStub(['find']);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      VehiculosService,
      { provide: getRepositoryToken(Vehiculo), useValue: vehiculoRepository },
      { provide: getRepositoryToken(TipoVehiculo), useValue: tipoVehiculoRepository },
      { provide: getRepositoryToken(Reserva), useValue: reservaRepository },
    ],
  }).compile();

  const service = module.get<VehiculosService>(VehiculosService);

  return {
    service,
    vehiculoRepository,
    tipoVehiculoRepository,
    reservaRepository,
  };
}