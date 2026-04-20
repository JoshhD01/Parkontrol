import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
export const expect = chai.expect as any;

import { AuthService } from 'src/service/auth/auth.service';
import { ClienteFactura } from 'src/entities/facturacion/entities/cliente-factura.entity';
import { ClienteAuth } from 'src/entities/auth/entities/cliente-auth.entity';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/service/usuarios/usuarios.service';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeStub(methods: string[]): Record<string, any> {
  return Object.fromEntries(
    methods.map((m) => [m, sinon.stub().resolves(undefined)]),
  );
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export async function createTestingModule() {
  const usuariosService = makeStub(['findUsuarioByCorreo']);
  const clienteFacturaRepository = makeStub(['findOne', 'create', 'save']);
  const clienteAuthRepository = makeStub(['findOne', 'create', 'save']);
  const jwtService = { sign: sinon.stub().returns('token-jwt') };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: JwtService, useValue: jwtService },
      { provide: UsuariosService, useValue: usuariosService },
      { provide: getRepositoryToken(ClienteFactura), useValue: clienteFacturaRepository },
      { provide: getRepositoryToken(ClienteAuth), useValue: clienteAuthRepository },
    ],
  }).compile();

  const service = module.get<AuthService>(AuthService);

  return {
    service,
    usuariosService,
    jwtService,
    clienteFacturaRepository,
    clienteAuthRepository,
  };
}