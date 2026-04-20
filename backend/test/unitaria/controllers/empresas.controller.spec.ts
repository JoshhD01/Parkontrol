import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { EmpresasController } from 'src/controller/empresas/empresas.controller';
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
  const empresaRepository = makeStub(['create', 'save', 'findOneBy', 'find']);

  const module: TestingModule = await Test.createTestingModule({
    controllers: [EmpresasController],
    providers: [
      EmpresasService,
      { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
    ],
  }).compile();

  const controller = module.get<EmpresasController>(EmpresasController);
  const service    = module.get<EmpresasService>(EmpresasService);

  return {
    controller,
    service,
    empresaRepository,
  };
}