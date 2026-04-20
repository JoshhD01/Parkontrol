import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { UsuariosController } from 'src/controller/usuarios/usuarios.controller';
import { UsuariosService } from 'src/service/usuarios/usuarios.service';
import { Usuario } from 'src/entities/usuarios/entities/usuario.entity';
import { UsuarioValidator } from 'src/controller/usuarios/validators/usuario.validator';
import { RolesService } from 'src/entities/shared/services/roles/roles.service';
import { EmpresasService } from 'src/service/empresas/empresas.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const usuarioRepository = makeStub([
    'find',
    'findOne',
    'create',
    'save',
    'remove',
  ]);

  const usuarioValidator = makeStub([
    'validarUsuarioUnico',
    'validarEsOperador',
  ]);

  const rolesService = makeStub(['findRoleByNombre']);
  const empresasService = makeStub(['findEmpresaById']);

  const module: TestingModule = await Test.createTestingModule({
    controllers: [UsuariosController],
    providers: [
      UsuariosService,
      { provide: getRepositoryToken(Usuario), useValue: usuarioRepository },
      { provide: UsuarioValidator, useValue: usuarioValidator },
      { provide: RolesService, useValue: rolesService },
      { provide: EmpresasService, useValue: empresasService },
    ],
  }).compile();

  const controller = module.get<UsuariosController>(UsuariosController);
  const service = module.get<UsuariosService>(UsuariosService);

  return {
    controller,
    service,
    usuarioRepository,
    usuarioValidator,
    rolesService,
    empresasService,
  };
}