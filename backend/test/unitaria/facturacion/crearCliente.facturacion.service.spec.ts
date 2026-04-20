import { createTestingModule } from './facturacion.service.module';
import { NotFoundException } from '@nestjs/common';

import chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
import sinon from 'sinon';

chai.use(chaiAsPromised);
const expect = chai.expect as any;

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('FacturacionService - crearCliente', () => {

  const sandbox = sinon.createSandbox();

  // ── Teardown ──────────────────────────────────────────────────────────────
  afterEach(() => {
    sandbox.restore();
  });

  // ==========================================================================
  // crearCliente()
  // ==========================================================================
  describe('crearCliente', () => {

    it('CS0001 - lanza NotFoundException si idUsuario existe pero no se encuentra', async () => {
      // Arrange
      const { service, usuarioRepository, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123',
        correo: 'test@test.com',
        idUsuario: 99,
      };

      usuarioRepository.findOne.resolves(null);

      // Act
      const action = service.crearCliente(dto as any);

      // Assert
      await expect(action).to.be.rejectedWith(NotFoundException);
      expect(usuarioRepository.findOne.calledWith({ where: { id: 99 } })).to.be.true;
      expect(clienteFacturaRepository.findOne.called).to.be.false;
    });

    it('CS0002 - crea cliente cuando no existe previamente', async () => {
      // Arrange
      const { service, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123',
        correo: 'test@test.com',
        idUsuario: undefined,
      };

      const clienteMock = { id: 10, correo: 'test@test.com' };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns(clienteMock);
      clienteFacturaRepository.save.resolves(clienteMock);

      // Act
      const result = await service.crearCliente(dto as any);

      // Assert
      expect(
        clienteFacturaRepository.create.calledWith(
          sinon.match({
            tipoDocumento: 'CC',
            numeroDocumento: '123',
            correo: 'test@test.com',
          }),
        ),
      ).to.be.true;
      expect(clienteFacturaRepository.save.calledWith(clienteMock)).to.be.true;
      expect(result).to.have.property('id', 10);
    });

    it('CS0003 - actualiza cliente existente con usuario', async () => {
      // Arrange
      const { service, clienteFacturaRepository, usuarioRepository } = await createTestingModule();

      const usuarioMock = { id: 5 };
      const clienteExistente = {
        id: 1,
        correo: 'old@test.com',
        usuario: null,
        numeroDocumento: 'ABC',
        tipoDocumento: 'CC',
      };

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: 'abc',
        correo: 'NEW@TEST.COM',
        idUsuario: 5,
      };

      usuarioRepository.findOne.resolves(usuarioMock);
      clienteFacturaRepository.findOne.resolves(clienteExistente);
      clienteFacturaRepository.save.resolves({
        ...clienteExistente,
        correo: 'new@test.com',
        usuario: usuarioMock,
      });

      // Act
      const result = await service.crearCliente(dto as any);

      // Assert
      expect(
        clienteFacturaRepository.save.calledWith(
          sinon.match({
            correo: 'new@test.com',
            usuario: usuarioMock,
          }),
        ),
      ).to.be.true;
      expect(result).to.have.property('correo', 'new@test.com');
    });

    it('CS0004 - normaliza tipoDocumento y numeroDocumento', async () => {
      // Arrange
      const { service, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento: '  cC ',
        numeroDocumento: '  abc123 ',
        correo: 'test@test.com',
      };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns({});
      clienteFacturaRepository.save.resolves({});

      // Act
      await service.crearCliente(dto as any);

      // Assert
      expect(
        clienteFacturaRepository.create.calledWith(
          sinon.match({
            tipoDocumento: 'CC',
            numeroDocumento: 'ABC123',
          }),
        ),
      ).to.be.true;
    });

    it('CS0005 - normaliza correo a minúsculas', async () => {
      // Arrange
      const { service, clienteFacturaRepository } = await createTestingModule();

      const dto = {
        tipoDocumento: 'cc',
        numeroDocumento: '123',
        correo: 'TEST@MAIL.COM',
      };

      clienteFacturaRepository.findOne.resolves(null);
      clienteFacturaRepository.create.returns({});
      clienteFacturaRepository.save.resolves({});

      // Act
      await service.crearCliente(dto as any);

      // Assert
      expect(
        clienteFacturaRepository.create.calledWith(
          sinon.match({
            correo: 'test@mail.com',
          }),
        ),
      ).to.be.true;
    });

  });

});