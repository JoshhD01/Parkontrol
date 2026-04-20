import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { ReservasService } from 'src/service/reservas/reservas.service';
import { Reserva } from 'src/entities/reservas/entities/reserva.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { VehiculosService } from 'src/service/vehiculos/vehiculos.service';
import { CeldasService } from 'src/service/celdas/celdas.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const reservaRepository = makeStub(['find', 'findOne', 'create', 'save', 'update']);
  const clienteFacturaRepository = makeStub(['findOne']);
  const vehiculosService = makeStub(['findVehiculoById']);
  const celdasService = makeStub(['findCeldaById', 'actualizarEstado']);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ReservasService,
      { provide: getRepositoryToken(Reserva), useValue: reservaRepository },
      { provide: getRepositoryToken(ClienteFactura), useValue: clienteFacturaRepository },
      { provide: VehiculosService, useValue: vehiculosService },
      { provide: CeldasService, useValue: celdasService },
    ],
  }).compile();

  const service = module.get<ReservasService>(ReservasService);

  return {
    service,
    reservaRepository,
    clienteFacturaRepository,
    vehiculosService,
    celdasService,
  };
}