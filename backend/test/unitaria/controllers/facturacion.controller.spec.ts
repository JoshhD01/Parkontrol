import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { FacturacionController } from 'src/controller/facturacion/facturacion.controller';
import { FacturacionService } from 'src/service/facturacion/facturacion.service';
import { FacturaElectronica } from 'src/entities/facturacion/entities/factura-electronica.entity';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { Usuario } from 'src/entities/usuarios/entities/usuario.entity';
import { PagosService } from 'src/service/pagos/pagos.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const facturaRepository        = makeStub(['find', 'findOne', 'create', 'save', 'createQueryBuilder']);
  const clienteFacturaRepository = makeStub(['find', 'findOne', 'create', 'save']);
  const usuarioRepository        = makeStub(['findOne']);
  const pagosService             = makeStub(['findPagoById']);

  const module: TestingModule = await Test.createTestingModule({
    controllers: [FacturacionController],
    providers: [
      FacturacionService,
      { provide: getRepositoryToken(FacturaElectronica), useValue: facturaRepository },
      { provide: getRepositoryToken(ClienteFactura),     useValue: clienteFacturaRepository },
      { provide: getRepositoryToken(Usuario),            useValue: usuarioRepository },
      { provide: PagosService,                           useValue: pagosService },
    ],
  }).compile();

  const controller = module.get<FacturacionController>(FacturacionController);
  const service    = module.get<FacturacionService>(FacturacionService);

  return {
    controller,
    service,
    facturaRepository,
    clienteFacturaRepository,
    usuarioRepository,
    pagosService,
  };
}