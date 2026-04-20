import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { VistasService } from 'src/service/vistas/vistas.service';
import { OcupacionParqueaderoView } from 'src/entities/vistas/entities/ocupacion-parqueadero.view';
import { HistorialReservasView } from 'src/entities/vistas/entities/historial-reservas.view';
import { FacturacionCompletaView } from 'src/entities/vistas/entities/facturacion-completa.view';
import { IngresosPorParqueaderoMensualView } from 'src/entities/vistas/entities/ingresos-parqueadero-mensual.view';
import { DataSource } from 'typeorm';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const ocupacionRepo = makeStub(['find']);
  const historialRepo = makeStub(['find']);
  const facturacionRepo = makeStub(['find']);
  const ingresosRepo = makeStub(['find']);
  const dataSource = { query: sinon.stub().resolves([]) };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      VistasService,
      { provide: getRepositoryToken(OcupacionParqueaderoView), useValue: ocupacionRepo },
      { provide: getRepositoryToken(HistorialReservasView), useValue: historialRepo },
      { provide: getRepositoryToken(FacturacionCompletaView), useValue: facturacionRepo },
      { provide: getRepositoryToken(IngresosPorParqueaderoMensualView), useValue: ingresosRepo },
      { provide: DataSource, useValue: dataSource },
    ],
  }).compile();

  const service = module.get<VistasService>(VistasService);

  return {
    service,
    ocupacionRepo,
    historialRepo,
    facturacionRepo,
    ingresosRepo,
    dataSource,
  };
}